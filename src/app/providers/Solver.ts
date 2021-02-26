import { Injectable } from '@angular/core';

import { BoundaryCondition } from './boundary/BoundaryCondition';
import { FemDataModel } from './FemDataModel';
import { Result } from './Result';
import { MeshModel } from './mesh/MeshModel';

import * as numeric from './libs/numeric-1.2.6.min.js';
import { View } from './View';
import { Bounds } from './Bounds';

import {ThreeService} from '../components/three/three.service'
import { ThreeDispService } from '../components/three/geometry/three-disp.service';

@Injectable({
  providedIn: 'root',
})

// 連立方程式求解オブジェクト
export class Solver {
  public PRECISION = 1e-10; // マトリックス精度
  public LU_METHOD = 0; // LU分解法
  public ILUCG_METHOD = 1; // 不完全LU分解共役勾配法

  public matrix: any[]; // 行列
  public matrix2: any[]; // 第２行列
  public vector: any[]; // ベクトル
  public dof: number; // モデル自由度
  public method: number; // 方程式解法

  public d: number;
  public coef:number;

  constructor(
    private model: FemDataModel,
    private view: View,
    private result: Result,
    private bounds: Bounds,
    private three:ThreeService,
    private threeDisp:ThreeDispService
  ) {
    this.clear();
    this.method = this.LU_METHOD;
  }

  // データを消去する
  public clear(): void {
    this.matrix = new Array();
    this.matrix2 = new Array();
    this.vector = new Array();
    this.dof = 0;
  }

  // 計算を開始する
  public calcStart() {
    try {
      const t0 = new Date().getTime();
      let calc = false;

      if (this.model.bc.restraints.length > 0) {
        this.dof = this.model.setNodeDoF();
        this.createStiffnessMatrix();
        this.d = this.solve();
        this.result.setDisplacement(
          this.model.bc,
          this.d,
          this.model.mesh.nodes.length
        );
        if (this.result.type === this.result.ELEMENT_DATA) {
          this.model.calculateElementStress();
        } else {
          this.model.calculateNodeStress();
        }
        calc = true;
      }
      if (!calc) {
        alert('拘束条件不足のため計算できません');
      }
      const t1 = new Date().getTime();
      const disp = this.result.displacement;
      const dcoef = this.threeDisp.dcoef//10;
      const dispMax = this.result.dispMax;
      const angleMax = this.result.angleMax;
      const coef = dcoef * Math.min(this.bounds.size / dispMax, 1 / angleMax);
      this.view.setDisplacement(disp, coef);
      this.three.ChangeMode('disp');
      //this.result.setConfig(disp,"0","6");
      // 変位とmagという情報を送る
      console.log('Calculation time:' + (t1 - t0) + 'ms');
    } catch (ex) {
      alert(ex);
    }
  }

  //コンター
  public conterStart() {
    try {
      const disp = 0;
      this.result.setConfig(disp, '0', '6');
    } catch (ex1) {
      alert(ex1);
    }
  }

  // 剛性マトリックス・荷重ベクトルを作成する
  public createStiffnessMatrix(): void {
    const bc: BoundaryCondition = this.model.bc;
    const bcList = bc.bcList;
    const reducedList = new Array();
    for (let i = 0; i < bcList.length; i++) {
      if (bcList[i] < 0) {
        reducedList.push(i);
      }
    }

    // 剛性マトリックス・荷重ベクトルの作成
    const matrix1: number[][] = this.stiffnessMatrix(this.dof);
    const vector1: number[] = this.loadVector(this.dof);

    // 拘束自由度を除去する
    for (let i = 0; i < bcList.length; i++) {
      if (bcList[i] >= 0) {
        const rx: number = bc.getRestDisp(bcList[i]);
        for (let j = 0; j < vector1.length; j++) {
          if (i in matrix1[j]) {
            vector1[j] -= rx * matrix1[j][i];
          }
        }
      }
    }
    this.extruct(matrix1, vector1, reducedList);
  }

  // 剛性マトリックスを作成する
  // dof - モデル自由度
  public stiffnessMatrix(dof) {
    const mesh: MeshModel = this.model.mesh;
    const elements = mesh.elements;
    const matrix = [];
    let km: number[][];
    let kmax = 0;
    for (let i = 0; i < dof; i++) matrix[i] = [];
    for (let i = 0; i < elements.length; i++) {
      const elem = elements[i];
      const material = this.model.materials[elem.material];
      const mat = material.matrix;
      if (elem.isShell) {
        const sp = this.model.shellParams[elem.param];
        if (elem.getName() === 'TriElement1') {
          km = elem.stiffnessMatrix(mesh.getNodes(elem), mat.m2d, sp);
        } else {
          km = elem.stiffnessMatrix(mesh.getNodes(elem), mat.msh, sp);
        }
        kmax = this.setElementMatrix(elem, 6, matrix, km, kmax);
      }
      //else if (elem.isBar) {
      //  const sect = this.model.barParams[elem.param].section;
      //  km = elem.stiffnessMatrix(mesh.getNodes(elem), material, sect);
      //  kmax = this.setElementMatrix(elem, 6, matrix, km, kmax);
      //}
      else {
        km = elem.stiffnessMatrix(mesh.getNodes(elem), mat.m3d);
        kmax = this.setElementMatrix(elem, 3, matrix, km, kmax);
      }
    }
    // 座標変換
    const rests = this.model.bc.restraints;
    const index = this.model.bc.nodeIndex;
    const bcdof = this.model.bc.dof;
    for (let i = 0; i < rests.length; i++) {
      const ri = rests[i];
      if (ri.coords) {
        ri.coords.transMatrix(matrix, dof, index[ri.node], bcdof[i]);
      }
    }
    // 絶対値が小さい成分を除去する
    const eps = this.PRECISION * kmax;
    for (let i = 0; i < dof; i++) {
      const mrow = matrix[i];
      for (let j of mrow) {
        if (mrow.hasOwnProperty(j)) {
          j = parseInt(j);
          if (Math.abs(mrow[j]) < eps) {
            delete mrow[j];
          }
        }
      }
    }
    return matrix;
  }

  // 要素のマトリックスを設定する
  // element - 要素
  // dof - 自由度
  // matrix - 全体剛性マトリックス
  // km - 要素の剛性マトリックス
  // kmax - 成分の絶対値の最大値
  public setElementMatrix(
    element: any,
    dof: number,
    matrix: number[][],
    km: number[][],
    kmax
  ) {
    const nodeCount = element.nodeCount();
    const index = this.model.bc.nodeIndex;
    const nodes = element.nodes;
    for (let i = 0; i < nodeCount; i++) {
      const row0 = index[nodes[i]];
      const i0 = dof * i;
      for (let j = 0; j < nodeCount; j++) {
        const column0 = index[nodes[j]];
        const j0 = dof * j;
        for (let i1 = 0; i1 < dof; i1++) {
          const mrow: number[] = matrix[row0 + i1];
          const krow: number[] = km[i0 + i1];
          for (let j1 = 0; j1 < dof; j1++) {
            const cj1 = column0 + j1;
            if (cj1 in mrow) {
              mrow[cj1] += krow[j0 + j1];
              kmax = Math.max(kmax, Math.abs(mrow[cj1]));
            } else {
              mrow[cj1] = krow[j0 + j1];
              kmax = Math.max(kmax, Math.abs(mrow[cj1]));
            }
          }
        }
      }
    }
    return kmax;
  }

  // 連立方程式を解く
  public solve() {
    const a = numeric.ccsSparse(this.matrix);
    return numeric.ccsLUPSolve(numeric.ccsLUP(a), this.vector);
  }

  // 荷重ベクトルを作成する
  // dof - モデル自由度
  public loadVector(dof) {
    const loads = this.model.bc.loads;
    // const press = this.model.bc.pressures;
    const vector = numeric.rep([dof], 0);
    const index = this.model.bc.nodeIndex;
    const bcdof = this.model.bc.dof;
    for (let i = 0; i < loads.length; i++) {
      const ld = loads[i];
      const nd = ld.node;
      const ldx = ld.globalX;
      const ldof = bcdof[nd];
      const index0 = index[nd];
      for (let j = 0; j < ldof; j++) {
        vector[index0 + j] = ldx[j];
      }
    }
    const rests = this.model.bc.restraints;
    for (let i = 0; i < rests.length; i++) {
      const ri = rests[i];
      if (ri.coords) {
        ri.coords.transVector(vector, dof, index[ri.node], bcdof[i]);
      }
    }
    return vector;
  }

  // 行列の一部を抽出する
  // matrix1,vector1 - 元のマトリックス,ベクトル
  // list - 抽出部分のリスト
  public extruct(matrix1, vector1, list) {
    this.matrix.length = 0;
    this.vector.length = 0;
    for (let i = 0; i < list.length; i++) {
      this.vector[i] = vector1[list[i]];
      this.matrix[i] = this.extructRow(matrix1[list[i]], list);
    }
  }

  // 行列の行から一部を抽出する
  // mrow - 元のマトリックスの行データ
  // list - 抽出部分のリスト
  public extructRow(mrow, list) {
    const exrow = [];
    const col = [];
    let i1 = 0;
    let j1 = 0;
    for (let j in mrow) {
      if (mrow.hasOwnProperty(j)) {
        col.push(parseInt(j));
      }
    }
    col.sort((j1, j2) => {
      return j1 - j2;
    });
    while (i1 < col.length && j1 < list.length) {
      if (col[i1] == list[j1]) {
        exrow[j1] = mrow[col[i1]];
        i1++;
        j1++;
      } else if (col[i1] < list[j1]) {
        i1++;
      } else {
        j1++;
      }
    }
    return exrow;
  }

  /*
 
  // 剛性マトリックス・質量マトリックスを作成する
  public createStiffMassMatrix=function(){
    const i,bc=model.bc,bcList=bc.bcList,reducedList=[];
    for(i=0;i<bcList.length;i++){
      if(bcList[i]<0){
        reducedList.push(i);
      }
    }
    const matrix1=stiffnessMatrix(this.dof),matrix2=massMatrix(this.dof);
  
    this.matrix.length=0;
    this.matrix2.length=0;
    for(i=0;i<reducedList.length;i++){
      this.matrix[i]=extructRow(matrix1[reducedList[i]],reducedList);
      this.matrix2[i]=extructRow(matrix2[reducedList[i]],reducedList);
    }
  };
  
  // 幾何剛性マトリックスを作成する
  public createGeomStiffMatrix=function(){
    const i,bc=model.bc,bcList=bc.bcList,reducedList=[];
    for(i=0;i<bcList.length;i++){
      if(bcList[i]<0){
        reducedList.push(i);
      }
    }
    const matrix2=geomStiffnessMatrix(this.dof);
  
    this.matrix2.length=0;
    for(i=0;i<reducedList.length;i++){
      this.matrix2[i]=extructRow(matrix2[reducedList[i]],reducedList);
    }
  };
  
  // 熱計算のマトリックス・ベクトルを計算する
  public createHeatMatrix=function(){
    const i,bcList=model.bc.bcList,reducedList=[];
    for(i=0;i<bcList.length;i++){
      if(bcList[i]<0){
        reducedList.push(i);
      }
    }
  
  // 伝熱マトリックス・熱境界条件ベクトルの作成
    const matrix1=heatMatrix(),vector1=tempVector(matrix1);
  
  // 拘束自由度を除去する
    for(i=0;i<bcList.length;i++){
      if(bcList[i]>=0){
        const t=model.bc.temperature[bcList[i]];
        for(const j=0;j<vector1.length;j++){
          if(i in matrix1[j]){
            vector1[j]-=t.t*matrix1[j][i];
          }
        }
      }
    }
    this.extruct(matrix1,vector1,reducedList);
  };
  


  
  // ランチョス法で固有値・固有ベクトルを求める
  // n - ３重対角化行列の大きさ
  // delta - シフト量δ
  public eigenByLanczos=function(n,delta){
    switch(this.method){
      case LU_METHOD:
        return eigByLanczosLUP(this.matrix,this.matrix2,n,delta);
      case ILUCG_METHOD:
        return eigByLanczosILUCG(this.matrix,this.matrix2,n,delta);
    }
  };
  
  // アーノルディ法で固有値・固有ベクトルを求める
  // n - ３重対角化行列の大きさ
  // delta - シフト量δ
  public eigenByArnoldi=function(n,delta){
    switch(this.method){
      case LU_METHOD:
        return eigByArnoldiLUP(this.matrix,this.matrix2,n,delta);
      case ILUCG_METHOD:
        return eigByArnoldiILUCG(this.matrix,this.matrix2,n,delta);
    }
  };
  
  // 質量マトリックスを作成する
  // dof - モデル自由度
  function massMatrix(dof){
    const mesh=model.mesh,elements=mesh.elements,matrix=[],i,j,mm,mmax=0;
    for(i=0;i<dof;i++) matrix[i]=[];
    for(i=0;i<elements.length;i++){
      const elem=elements[i];
      const material=model.materials[elem.material],dens=material.dens;
      if(elem.isShell){
        const sp=model.shellParams[elem.param];
        mm=elem.massMatrix(mesh.getNodes(elem),dens,sp.thickness);
        mmax=setElementMatrix(elem,6,matrix,mm,mmax);
      }
      else if(elem.isBar){
        const sect=model.barParams[elem.param].section;
        mm=elem.massMatrix(mesh.getNodes(elem),dens,sect);
        mmax=setElementMatrix(elem,6,matrix,mm,mmax);
      }
      else{
        mm=elem.massMatrix(mesh.getNodes(elem),dens);
        mmax=setElementMatrix(elem,3,matrix,mm,mmax);
      }
    }
  // 座標変換
    const rests=model.bc.restraints;
    const index=model.bc.nodeIndex,bcdof=model.bc.dof;
    for(i=0;i<rests.length;i++){
      const ri=rests[i];
      if(ri.coords){
        ri.coords.transMatrix(matrix,dof,index[ri.node],bcdof[i]);
      }
    }
  // 絶対値が小さい成分を除去する
    const eps=PRECISION*mmax;
    for(i=0;i<dof;i++){
      const mrow=matrix[i];
      for(j in mrow){
        if(mrow.hasOwnProperty(j)){
          j=parseInt(j);
          if(Math.abs(mrow[j])<eps){
            delete mrow[j];
          }
        }
      }
    }
    return matrix;
  }
  
  
  // 幾何剛性マトリックスを作成する
  // dof - モデル自由度
  function geomStiffnessMatrix(dof){
    const mesh=model.mesh,elements=mesh.elements,nodes=mesh.nodes;
    const disp=model.result.displacement;
    const matrix=[],i,j,km,kmax=0,p=[],v=[];
    for(i=0;i<dof;i++) matrix[i]=[];
    for(i=0;i<elements.length;i++){
      const elem=elements[i],en=elem.nodes;
      p.length=0;
      v.length=0;
      for(j=0;j<en.length;j++){
        p[j]=nodes[en[j]];
        v[j]=disp[en[j]];
      }
      const material=model.materials[elem.material],mat=material.matrix;
      if(elem.isShell){
        const sp=model.shellParams[elem.param];
        if(elem.getName()==='TriElement1'){
          km=elem.geomStiffnessMatrix(p,v,mat.m2d,sp);
        }
        else{
          km=elem.geomStiffnessMatrix(p,v,mat.msh,sp);
        }
        kmax=setElementMatrix(elem,6,matrix,km,kmax);
      }
      else if(elem.isBar){
        const sect=model.barParams[elem.param].section;
        km=elem.geomStiffnessMatrix(p,v,material,sect);
        kmax=setElementMatrix(elem,6,matrix,km,kmax);
      }
      else{
        km=elem.geomStiffnessMatrix(p,v,mat.m3d);
        kmax=setElementMatrix(elem,3,matrix,km,kmax);
      }
    }
  // 座標変換
    const rests=model.bc.restraints;
    const index=model.bc.nodeIndex,bcdof=model.bc.dof;
    for(i=0;i<rests.length;i++){
      const ri=rests[i];
      if(ri.coords){
        ri.coords.transMatrix(matrix,dof,index[ri.node],bcdof[i]);
      }
    }
  // 絶対値が小さい成分を除去・符号反転
    const eps=PRECISION*kmax;
    for(i=0;i<dof;i++){
      const mrow=matrix[i];
      for(j in mrow){
        if(mrow.hasOwnProperty(j)){
          j=parseInt(j);
          if(Math.abs(mrow[j])<eps){
            delete mrow[j];
          }
          else{
            mrow[j]=-mrow[j];
          }
        }
      }
    }
    return matrix;
  }
 
  
  
  // 伝熱マトリックスを作成する
  function heatMatrix(){
    const elements=model.mesh.elements,mesh=model.mesh;
    const dof=model.mesh.nodes.length,matrix=[],i;
    for(i=0;i<dof;i++) matrix[i]=[];
    for(i=0;i<elements.length;i++){
      const elem=elements[i],count=elem.nodeCount();
      const h=model.materials[elem.material].hCon,ls;
      if(elem.isShell){
        const sp=model.shellParams[elem.param];
        ls=elem.gradMatrix(mesh.getNodes(elem),h,sp);
      }
      else if(elem.isBar){
        const sect=model.barParams[elem.param].section;
        ls=elem.gradMatrix(mesh.getNodes(elem),h,sect);
      }
      else{
        ls=elem.gradMatrix(mesh.getNodes(elem),h);
      }
      for(const i1=0;i1<count;i1++){
        const mrow=matrix[elem.nodes[i1]],lrow=ls[i1];
        for(const j1=0;j1<count;j1++){
          if(elem.nodes[j1] in mrow){
            mrow[elem.nodes[j1]]+=lrow[j1];
          }
          else{
            mrow[elem.nodes[j1]]=lrow[j1];
          }
        }
      }
    }
    return matrix;
  }
  
  // 熱境界条件ベクトルを作成する
  // matrix - 伝熱マトリックス
  function tempVector(matrix){
    const htcs=model.bc.htcs,i;
    const vector=numeric.rep([model.mesh.nodes.length],0);
    for(i=0;i<htcs.length;i++){
      const elem=model.mesh.elements[htcs[i].element];
      const border=htcs[i].getBorder(elem);
      const p=model.mesh.getNodes(border);
      const h=htcs[i].htc;
      if(border.isEdge){
        const sp=model.shellParams[elem.param];
        h*=sp.thickness;
      }
      const hm=border.shapeFunctionMatrix(p,h);
      const hv=border.shapeFunctionVector(p,h*htcs[i].outTemp);
      const count=border.nodeCount();
      for(const i1=0;i1<count;i1++){
        const mrow=matrix[border.nodes[i1]],hrow=hm[i1];
        for(const j1=0;j1<count;j1++){
          if(border.nodes[j1] in mrow){
            mrow[border.nodes[j1]]+=hrow[j1];
          }
          else{
            mrow[border.nodes[j1]]=hrow[j1];
          }
        }
        vector[border.nodes[i1]]+=hv[i1];
      }
    }
    return vector;
  }


  
  // 固有振動解析の計算を開始する
  function vibCalcStart(){
    try{
      const count=parseInt(document.getElementById('eigennumber').value);
      model.charVib(count);
      resultView.setInitEigen();
    }
    catch(ex){
      alert(ex);
    }
  }
  
  // 線形座屈解析の計算を開始する
  function buckCalcStart(){
  //  try{
      const count=parseInt(document.getElementById('eigennumber').value);
      model.calcBuckling(count);
      resultView.setInitEigen();
    }
    catch(ex){
      alert(ex);
    }
  }
  
  // 計算設定ウィンドウを表示する
  function showCalc(){
    showModalWindow(CALC_WINDOW);
    const elems=document.getElementsByName('method');
    elems[model.solver.method].checked=true;
  }
  
  // 計算設定を取り消す
  function calcCancel(){
    hideModalWindow(CALC_WINDOW);
  }
  
    */
}
