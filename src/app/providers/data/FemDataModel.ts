import * as THREE from 'three';
import { Material } from './Material';
import { BoundaryCondition } from '../BoundaryCondition';
import { ResultService } from '../result.service';
import { SolverService } from '../Solver';


//--------------------------------------------------------------------//
// FEM データモデル
export class FemDataModel {

  private COEF_F_W = 0.5 / Math.PI;	// f/ω比 1/2π
  public materials: any[];          // 材料
  public shellParams: any[];        // シェルパラメータ
  public barParams: any[];          // 梁パラメータ
  public coordinates: any[];        // 局所座標系
  public hasShellBar: boolean;      // シェル要素または梁要素を含まない

  constructor(public mesh: MeshModel,
              public bc: BoundaryCondition,
              private solver: SolverService,
              private result: ResultService) { 
  }

// データを消去する
public clear(): void {
  this.materials = new Array();
  this.shellParams = new Array();
  this.barParams = new Array();
  this.coordinates = new Array();
  this.mesh.clear(); // メッシュモデル
  this.bc.clear();    // 境界条件
  this.result.clear(); // 計算結果
}

// モデルを初期化する
public init(): void {
  this.solver.method = this.solver.ILUCG_METHOD;	// デフォルトは反復解法
  const mats = this.materials;
  mats.sort(compareLabel);
  this.mesh.init();
  this.bc.init();
  this.reNumbering();
  this.resetMaterialLabel();
  this.resetParameterLabel();
  this.resetCoordinates();
  this.mesh.checkChirality();
  this.mesh.getFreeFaces();
  this.mesh.getFaceEdges();
  for (const i = 0; i < mats.length; i++) {
    const m2d = mats[i].matrix2Dstress();
    const msh = mats[i].matrixShell();
    const m3d = mats[i].matrix3D();
    mats[i].matrix = { m2d: m2d, msh: msh, m3d: m3d };
  }
}

// 節点・要素ポインタを設定する
public reNumbering(): void {
  const nodes = this.mesh.nodes;
  const elements = this.mesh.elements;
  const map = [];
  for (let i = 0; i < nodes.length; i++) {
    map[nodes[i].label] = i;
  }
  for (let i = 0; i < elements.length; i++) {
    this.resetNodes(map, elements[i]);
  }
  for (let i = 0; i < this.bc.restraints.length; i++) {
    this.resetNodePointer(map, this.bc.restraints[i]);
  }
  for (let i = 0; i < this.bc.loads.length; i++) {
    this.resetNodePointer(map, this.bc.loads[i]);
  }
  for (let i = 0; i < this.bc.temperature.length; i++) {
    this.resetNodePointer(map, this.bc.temperature[i]);
  }
  map.length = 0;
  for (let i = 0; i < elements.length; i++) {
    map[elements[i].label] = i;
  }
  for (let i = 0; i < this.bc.pressures.length; i++) {
    this.resetElementPointer(map, this.bc.pressures[i]);
  }
  for (let i = 0; i < this.bc.htcs.length; i++) {
    this.resetElementPointer(map, this.bc.htcs[i]);
  }
}

// 材料ポインタを設定する
public resetMaterialLabel(): void {
  if (this.materials.length === 0) {
    this.materials.push(new Material(1, 1, 0.3, 1, 1, 1)); //, 1));
  }
  const map = [];
  const elements = this.mesh.elements;
  for (let i = 0; i < this.materials.length; i++) {
    map[this.materials[i].label] = i;
  }
  for (let i = 0; i < elements.length; i++) {
    if (elements[i].material in map) {
      elements[i].material = map[elements[i].material];
    }
    else {
      throw new Error('材料番号' + elements[i].material +
        'は存在しません');
    }
  }
}

// シェルパラメータ・梁パラメータのポインタを設定する
public resetParameterLabel(): void{
  if ((this.shellParams.length === 0) && (this.barParams.length === 0)) {
    this.hasShellBar = false;
    return;
  }
  const map1 = [];
  const map2 = [];
  const elements = this.mesh.elements;
  let shellbars = 0;
  for (let i = 0; i < this.shellParams.length; i++) {
    map1[this.shellParams[i].label] = i;
  }
  for (let i = 0; i < this.barParams.length; i++) {
    map2[this.barParams[i].label] = i;
  }
  for (let i = 0; i < elements.length; i++) {
    if (elements[i].isShell) {
      if (elements[i].param in map1) {
        elements[i].param = map1[elements[i].param];
        shellbars++;
      }
      else {
        throw new Error('パラメータ番号' + elements[i].param +
          'は存在しません');
      }
    }
    else if (elements[i].isBar) {
      if (elements[i].param in map2) {
        elements[i].param = map2[elements[i].param];
        shellbars++;
      }
      else {
        throw new Error('パラメータ番号' + elements[i].param +
          'は存在しません');
      }
    }
  }
  this.hasShellBar = (shellbars > 0);
  if (this.hasShellBar) {		// シェル要素・梁要素を含む場合は直接解法
    this.solver.method = this.solver.LU_METHOD;
  }
}

// 局所座標系を設定する
public resetCoordinates(): void {
  if (this.coordinates.length === 0) {
    return;
  }
  const map = [];
  for (let i = 0; i < this.coordinates.length; i++) {
    map[this.coordinates[i].label] = this.coordinates[i];
  }
  for (let i = 0; i < this.bc.restraints.length; i++) {
    resetCoordinatesPointer(map, this.bc.restraints[i]);
  }
  for (let i = 0; i < this.bc.loads.length; i++) {
    resetCoordinatesPointer(map, this.bc.loads[i]);
  }
}

// 節点の自由度を設定する
public setNodeDoF(): void {
  const dof = this.bc.dof;
  const nodeCount = this.mesh.nodes.length;
  const elemCount = this.mesh.elements.length;
  dof.length = 0;
  for (let i = 0; i < nodeCount; i++) {
    dof[i] = 3;
  }
  for (let i = 0; i < elemCount; i++) {
    const elem = this.mesh.elements[i];
    if (elem.isShell || elem.isBar) {	// シェル要素・梁要素
      const count = elem.nodeCount();
      for (const j = 0; j < count; j++) {
        dof[elem.nodes[j]] = 6;
      }
    }
  }
  this.solver.dof = this.bc.setPointerStructure(nodeCount);
}

// 静解析をする
public calculate(): void {
  const t0 = new Date().getTime();
  let calc = false;
  if ((this.bc.temperature.length > 0) || (this.bc.htcs.length > 0)) {
    this.solver.dof = this.mesh.nodes.length;
    this.bc.setPointerHeat(this.solver.dof);
    this.solver.createHeatMatrix();
    const tmp = this.solver.solve();
    this.result.setTemperature(this.bc, tmp, this.mesh.nodes.length);
    calc = true;
  }
  if (this.bc.restraints.length > 0) {
    this.setNodeDoF();
    this.solver.createStiffnessMatrix();
    const d = this.solver.solve();
    this.result.setDisplacement(this.bc, d, this.mesh.nodes.length);
    if (this.result.type === this.result.ELEMENT_DATA) {
      this.calculateElementStress();
    }
    else {
      this.calculateNodeStress();
    }
    calc = true;
  }
  if (!calc) {
    alert('拘束条件不足のため計算できません');
  }
  const t1 = new Date().getTime();
  console.log('Calculation time:' + (t1 - t0) + 'ms');
}

// 固有振動数・固有ベクトルを求める
// count - 求める固有振動の数
public charVib(count: number): void {
  const t0 = new Date().getTime();
  this.result.clear();
  this.setNodeDoF();
  count = Math.min(count, this.solver.dof);
  const n = Math.min(3 * count, this.solver.dof);
  this.solver.createStiffMassMatrix();
  const eig = this.solver.eigenByLanczos(n);
  const nodeCount = this.mesh.nodes.length;
  for (let i = count; i < n; i++){
    delete eig.ut[i];
  }
  for (let i = 0; i < count; i++) {
    const f = this.COEF_F_W * Math.sqrt(Math.max(eig.lambda[i], 0));
    const uti = eig.ut[i];
    let s = 0;
    for (let j = 0; j < uti.length; j++) {
      s += uti[j] * uti[j];
    }
    const u = numeric.mul(1 / Math.sqrt(s), uti);
    const ev = new EigenValue(f, this.result.VIBRATION);
    ev.setDisplacement(this.bc, u, nodeCount);
    this.result.addEigenValue(ev);
    if (this.result.type === this.result.ELEMENT_DATA) {
      this.calculateEvElementEnergy(ev);
    }
    else {
      this.calculateEvNodeEnergy(ev);
    }
    delete eig.ut[i];
  }
  const t1 = new Date().getTime();
  console.log('Calculation time:' + (t1 - t0) + 'ms');
}

// 線形座屈解析をする
// count - 求める固有値の数
public calcBuckling(count: number) {
  const t0 = new Date().getTime();
  if (this.bc.restraints.length === 0) {
    throw new Error('拘束条件がありません');
  }
  this.setNodeDoF();
  const n = Math.min(3 * count, this.solver.dof);
  this.solver.createStiffnessMatrix();
  const d = this.solver.solve();
  this.result.setDisplacement(this.bc, d, this.mesh.nodes.length);
  this.solver.createGeomStiffMatrix();
  this.result.clear();
  const eig = this.solver.eigenByArnoldi(n, 0);
  const nodeCount = this.mesh.nodes.length;
  for (let i = count; i < n; i++) {
    delete eig.ut[i];
  }
  for (let i = 0; i < count; i++) {
    const uti = eig.ut[i]
    let s = 0;
    for (let j = 0; j < uti.length; j++) {
      s += uti[j] * uti[j];
    }
    const u = numeric.mul(1 / Math.sqrt(s), uti);
    const ev = new EigenValue(eig.lambda[i], this.result.BUCKLING);
    ev.setDisplacement(this.bc, u, nodeCount);
    this.result.addEigenValue(ev);
    if (this.result.type === this.result.ELEMENT_DATA) {
      this.calculateEvElementEnergy(ev);
    }
    else {
      this.calculateEvNodeEnergy(ev);
    }
    delete eig.ut[i];
  }
  const t1 = new Date().getTime();
  console.log('Calculation time:' + (t1 - t0) + 'ms');
};

// 節点歪・応力・歪エネルギー密度を計算する
public calculateNodeStress(): void{
  const nodes = this.mesh.nodes;
  const nodeCount = nodes.length;
  const elems = this.mesh.elements;
  const elemCount = elems.length;
  const angle = numeric.rep([nodeCount], 0);
  this.result.initStrainAndStress(nodeCount);
  for (let i = 0; i < elemCount; i++) {
    const elem = elems[i]
    const en = elem.nodes;
    const p: any[] = new Array();
    const v: any[] = new Array();
    for (let j = 0; j < en.length; j++) {
      p[j] = nodes[en[j]];
      v[j] = this.result.displacement[en[j]];
    }
    const material = this.materials[elem.material];
    const mat = material.matrix;
    const ea = elem.angle(p);
    if (elem.isShell) {
      const sp = this.model.shellParams[elem.param];
      let mmat: any;
      if (elem.getName() === 'TriElement1') {
        mmat = mat.m2d;
      }
      else {
        mmat = mat.msh;
      }
      const s = elem.strainStress(p, v, mmat, sp);
      const eps1 = s[0];
      const str1 = s[1];
      const se1 = s[2];
      const eps2 = s[3];
      const str2 = s[4];
      const se2 = s[5];
      for (let j = 0; j < en.length; j++) {
        const eaj = ea[j];
        eps1[j].mul(eaj);
        eps2[j].mul(eaj);
        str1[j].mul(eaj);
        str2[j].mul(eaj);
        se1[j] *= eaj;
        se2[j] *= eaj;
        this.result.addStructureData(en[j], eps1[j], str1[j], se1[j],
          eps2[j], str2[j], se2[j]);
        angle[en[j]] += eaj;
      }
    }
    else if (elem.isBar) {
      const sect = model.barParams[elem.param].section;
      const s = elem.strainStress(p, v, material, sect);
      const eps1 = s[0];
      const str1 = s[1];
      const se1 = s[2];
      const eps2 = s[3];
      const str2 = s[4];
      const se2 = s[5];
      for (let j = 0; j < en.length; j++) {
        this.result.addStructureData(en[j], eps1[j], str1[j], se1[j],
          eps2[j], str2[j], se2[j]);
        angle[en[j]]++;
      }
    }
    else {
      const s = elem.strainStress(p, v, mat.m3d);
      const eps1 = s[0];
      const str1 = s[1];
      const se1 = s[2];
      for (let j = 0; j < en.length; j++) {
        const eaj = ea[j];
        eps1[j].mul(eaj);
        str1[j].mul(eaj);
        se1[j] *= eaj;
        this.result.addStructureData(en[j], eps1[j], str1[j], se1[j],
          eps1[j], str1[j], se1[j]);
        angle[en[j]] += eaj;
      }
    }
  }
  for (let i = 0; i < nodeCount; i++) {
    if (angle[i] !== 0) {
      this.result.mulStructureData(i, 1 / angle[i]);
    }
  }
}

// 要素歪・応力・歪エネルギー密度を計算する
public calculateElementStress(): void {
  const nodes = this.mesh.nodes;
  const elems = this.mesh.elements;
  const elemCount = elems.length;
  this.result.initStrainAndStress(elemCount);
  for (let i = 0; i < elemCount; i++) {
    const elem = elems[i], en = elem.nodes;
    const p = new Array();
    const v = new Array();
    for (let j = 0; j < en.length; j++) {
      p[j] = nodes[en[j]];
      v[j] = this.result.displacement[en[j]];
    }
    const material = this.materials[elem.material], mat = material.matrix;
    if (elem.isShell) {
      const sp = this.shellParams[elem.param];
      let mmat: any;
      if (elem.getName() === 'TriElement1') {
        mmat = mat.m2d;
      }
      else {
        mmat = mat.msh;
      }
      const s = elem.elementStrainStress(p, v, mmat, sp);
      this.result.addStructureData(i, s[0], s[1], s[2], s[3], s[4], s[5]);
    }
    else if (elem.isBar) {
      const sect = this.barParams[elem.param].section;
      const s = elem.elementStrainStress(p, v, material, sect);
      this.result.addStructureData(i, s[0], s[1], s[2], s[3], s[4], s[5]);
    }
    else {
      const s = elem.elementStrainStress(p, v, mat.m3d);
      this.result.addStructureData(i, s[0], s[1], s[2], s[0], s[1], s[2]);
    }
  }
}

// 固有値データの節点歪エネルギー密度を計算する
// ev - 固有値データ
public calculateEvNodeEnergy(ev) {
  const nodes = this.mesh.nodes, nodeCount = nodes.length;
  const elems = this.mesh.elements, elemCount = elems.length;
  const angle = numeric.rep([nodeCount], 0), p = [], v = [], i, j, s, enj, eaj, se1, se2;
  ev.initStrainEnergy(nodeCount);
  for (i = 0; i < elemCount; i++) {
    const elem = elems[i], en = elem.nodes;
    p.length = 0;
    v.length = 0;
    for (j = 0; j < en.length; j++) {
      p[j] = nodes[en[j]];
      v[j] = ev.displacement[en[j]];
    }
    const material = this.materials[elem.material], mat = material.matrix;
    const ea = elem.angle(p);
    if (elem.isShell) {
      const sp = model.shellParams[elem.param], mmat;
      if (elem.getName() === 'TriElement1') {
        mmat = mat.m2d;
      }
      else {
        mmat = mat.msh;
      }
      s = elem.strainStress(p, v, mmat, sp);
      se1 = s[2];
      se2 = s[5];
      for (j = 0; j < en.length; j++) {
        enj = en[j];
        eaj = ea[j];
        se1[j] *= eaj;
        se2[j] *= eaj;
        ev.sEnergy1[enj] += se1[j];
        ev.sEnergy2[enj] += se2[j];
        angle[enj] += eaj;
      }
    }
    else if (elem.isBar) {
      const sect = model.barParams[elem.param].section;
      s = elem.strainStress(p, v, material, sect);
      se1 = s[2];
      se2 = s[5];
      for (j = 0; j < en.length; j++) {
        enj = en[j];
        ev.sEnergy1[enj] += se1[j];
        ev.sEnergy2[enj] += se2[j];
        angle[enj]++;
      }
    }
    else {
      s = elem.strainStress(p, v, mat.m3d);
      se1 = s[2];
      for (j = 0; j < en.length; j++) {
        enj = en[j];
        eaj = ea[j];
        se1[j] *= eaj;
        ev.sEnergy1[enj] += se1[j];
        ev.sEnergy2[enj] += se1[j];
        angle[enj] += eaj;
      }
    }
  }
  for (i = 0; i < nodeCount; i++) {
    if (angle[i] !== 0) {
      const coef = 1 / angle[i];
      ev.sEnergy1[i] *= coef;
      ev.sEnergy2[i] *= coef;
    }
  }
};

// 固有値データの要素歪エネルギー密度を計算する
// ev - 固有値データ
FemDataModel.prototype.calculateEvElementEnergy = function (ev) {
  const nodes = this.mesh.nodes, p = [], v = [], s;
  const elems = this.mesh.elements, elemCount = elems.length;
  ev.initStrainEnergy(elemCount);
  for (const i = 0; i < elemCount; i++) {
    const elem = elems[i], en = elem.nodes;
    p.length = 0;
    v.length = 0;
    for (const j = 0; j < en.length; j++) {
      p[j] = nodes[en[j]];
      v[j] = ev.displacement[en[j]];
    }
    const material = this.materials[elem.material], mat = material.matrix;
    if (elem.isShell) {
      const sp = model.shellParams[elem.param], mmat;
      if (elem.getName() === 'TriElement1') {
        mmat = mat.m2d;
      }
      else {
        mmat = mat.msh;
      }
      s = elem.elementStrainStress(p, v, mmat, sp);
      ev.sEnergy1[i] = s[2];
      ev.sEnergy2[i] = s[5];
    }
    else if (elem.isBar) {
      const sect = model.barParams[elem.param].section;
      s = elem.elementStrainStress(p, v, material, sect);
      ev.sEnergy1[i] = s[2];
      ev.sEnergy2[i] = s[5];
    }
    else {
      s = elem.elementStrainStress(p, v, mat.m3d);
      ev.sEnergy1[i] = s[2];
      ev.sEnergy2[i] = s[2];
    }
  }
};

// データ文字列を返す
FemDataModel.prototype.toStrings = function () {
  const s = [], i, nodes = this.mesh.nodes, elems = this.mesh.elements;
  for (i = 0; i < this.materials.length; i++) {
    s.push(this.materials[i].toString());
  }
  for (i = 0; i < this.shellParams.length; i++) {
    s.push(this.shellParams[i].toString());
  }
  for (i = 0; i < this.barParams.length; i++) {
    s.push(this.barParams[i].toString());
  }
  for (i = 0; i < this.coordinates.length; i++) {
    s.push(this.coordinates[i].toString());
  }
  for (i = 0; i < nodes.length; i++) {
    s.push(nodes[i].toString());
  }
  for (i = 0; i < elems.length; i++) {
    if (elems[i].isShell) {
      s.push(elems[i].toString(this.materials, this.shellParams, nodes));
    }
    else if (elems[i].isBar) {
      s.push(elems[i].toString(this.materials, this.barParams, nodes));
    }
    else {
      s.push(elems[i].toString(this.materials, nodes));
    }
  }
  Array.prototype.push.apply(s, this.bc.toStrings(nodes, elems));
  Array.prototype.push.apply(s, this.result.toStrings(nodes, elems));
  return s;
};

// 節点集合の節点ラベルを再設定する
// map - ラベルマップ
// s - 節点集合
function resetNodes(map, s) {
  for (const i = 0; i < s.nodes.length; i++) {
    if (s.nodes[i] in map) {
      s.nodes[i] = map[s.nodes[i]];
    }
    else {
      throw new Error('節点番号' + s.nodes[i] + 'は存在しません');
    }
  }
}

// 節点ポインタを再設定する
// map - ラベルマップ
// bc - 境界条件
function resetNodePointer(map, bc) {
  if (bc.node in map) {
    bc.node = map[bc.node];
  }
  else {
    throw new Error('節点番号' + bc.node + 'は存在しません');
  }
}

// 要素ポインタを再設定する
// map - ラベルマップ
// bc - 境界条件
function resetElementPointer(map, bc) {
  if (bc.element in map) {
    bc.element = map[bc.element];
  }
  else {
    throw new Error('要素番号' + bc.element + 'は存在しません');
  }
}

// 局所座標系を再設定する
// map - ラベルマップ
// bc - 境界条件
function resetCoordinatesPointer(map, bc) {
  const coords = bc.coords;
  if ((coords === null) || (coords === undefined)) {
  }
  else if (coords in map) {
    bc.coords = map[coords];
    bc.globalX = bc.coords.toGlobal(bc.x);
  }
  else {
    throw new Error('局所座標系番号' + coords + 'は存在しません');
  }
*/
}


//--------------------------------------------------------------------//
// メッシュモデル
export class MeshModel {

  public nodes: any[];      // 節点
  public elements: any[];   // 要素
  public freeFaces: any[];  // 表面
  public faceEdges: any[];  // 表面の要素辺

  constructor() {
    this.clear();
   }


// データを消去する
public clear(): void{
  this.nodes= new Array();	
  this.elements= new Array();	
  this.freeFaces= new Array();	
  this.faceEdges= new Array();	
};
/*

// モデルを初期化する
MeshModel.prototype.init = function () {
  this.nodes.sort(compareLabel);
  bounds.set();
};

// 要素の鏡像向きを揃える
MeshModel.prototype.checkChirality = function () {
  for (const i = 0; i < this.elements.length; i++) {
    const elem = this.elements[i];
    if (!elem.isShell && !elem.isBar) {
      const pe = this.getNodes(elem);
      const pf = this.getNodes(elem.border(i, 0));
      const n1 = normalVector(pf);
      const n2 = center(pe).sub(center(pf));
      if (n1.dot(n2) > 0) {
        elem.mirror();
      }
    }
  }
};

// 表面を取り出す
MeshModel.prototype.getFreeFaces = function () {
  const elems = this.elements, i;
  if (elems.length === 0) return;
  this.freeFaces.length = 0;
  const border = [];
  for (i = 0; i < elems.length; i++) {
    if (elems[i].isShell) {
      this.freeFaces.push(elems[i].border(i, 0));
    }
    else if (!elems[i].isBar) {
      const count = elems[i].borderCount();
      for (const j = 0; j < count; j++) {
        border.push(elems[i].border(i, j));
      }
    }
  }
  if (border.length > 0) {
    border.sort(function (b1, b2) { return b1.compare(b2); });
    const addsw = true, beforeEb = border[0];
    for (i = 1; i < border.length; i++) {
      const eb = border[i];
      if (beforeEb.compare(eb) === 0) {
        addsw = false;
      }
      else {
        if (addsw) this.freeFaces.push(beforeEb);
        beforeEb = eb;
        addsw = true;
      }
    }
    if (addsw) this.freeFaces.push(beforeEb);
  }
};

// 表面の要素辺を取り出す
MeshModel.prototype.getFaceEdges = function () {
  if (this.freeFaces.length === 0) return;
  this.faceEdges.length = 0;
  const edges = [], i;
  for (i = 0; i < this.freeFaces.length; i++) {
    const nds = this.freeFaces[i].cycleNodes();
    for (const j = 0; j < nds.length; j++) {
      edges.push(new EdgeBorder1(i, [nds[j], nds[(j + 1) % nds.length]]));
    }
  }
  if (edges.length > 0) {
    edges.sort(function (b1, b2) { return b1.compare(b2); });
    const beforeEdge = edges[0];
    this.faceEdges.push(beforeEdge);
    for (i = 1; i < edges.length; i++) {
      const edge = edges[i];
      if (beforeEdge.compare(edge) !== 0) {
        this.faceEdges.push(edge);
        beforeEdge = edge;
      }
    }
  }
};

// 形状データを取り出す
MeshModel.prototype.getGeometry = function () {
  const sb = [], i;
  for (i = 0; i < this.freeFaces.length; i++) {
    Array.prototype.push.apply(sb, this.freeFaces[i].splitBorder());
  }
  const pos = new Float32Array(9 * sb.length);
  const norm = new Float32Array(9 * sb.length);
  const colors = new Float32Array(9 * sb.length);
  const geometry = new THREE.BufferGeometry();
  geometry.elements = new Int32Array(3 * sb.length);
  geometry.nodes = new Int32Array(3 * sb.length);
  geometry.angle = new Float32Array(9 * sb.length);
  for (i = 0; i < sb.length; i++) {
    const i9 = 9 * i, v = sb[i].nodes, elem = sb[i].element;
    const p = [this.nodes[v[0]], this.nodes[v[1]], this.nodes[v[2]]];
    const n = normalVector(p);
    for (const j = 0; j < 3; j++) {
      const j3 = i9 + 3 * j;
      geometry.elements[3 * i + j] = elem;
      geometry.nodes[3 * i + j] = v[j];
      pos[j3] = p[j].x;
      pos[j3 + 1] = p[j].y;
      pos[j3 + 2] = p[j].z;
      norm[j3] = n.x;
      norm[j3 + 1] = n.y;
      norm[j3 + 2] = n.z;
      colors[j3] = meshColors[0];
      colors[j3 + 1] = meshColors[1];
      colors[j3 + 2] = meshColors[2];
      geometry.angle[j3] = 0;
      geometry.angle[j3 + 1] = 0;
      geometry.angle[j3 + 2] = 0;
    }
  }
  geometry.addAttribute('position', new THREE.BufferAttribute(pos, 3));
  geometry.addAttribute('normal', new THREE.BufferAttribute(norm, 3));
  geometry.addAttribute('color', new THREE.BufferAttribute(colors, 3));
  return geometry;
};

// 要素辺の形状データを取り出す
MeshModel.prototype.getEdgeGeometry = function () {
  const edges = this.faceEdges;
  const pos = new Float32Array(6 * edges.length);
  const geometry = new THREE.BufferGeometry();
  geometry.nodes = new Int32Array(2 * edges.length);
  geometry.angle = new Float32Array(6 * edges.length);
  for (const i = 0; i < edges.length; i++) {
    const i2 = 2 * i, i6 = 6 * i, v = edges[i].nodes;
    const p1 = this.nodes[v[0]], p2 = this.nodes[v[1]];
    geometry.nodes[i2] = v[0];
    geometry.nodes[i2 + 1] = v[1];
    pos[i6] = p1.x;
    pos[i6 + 1] = p1.y;
    pos[i6 + 2] = p1.z;
    pos[i6 + 3] = p2.x;
    pos[i6 + 4] = p2.y;
    pos[i6 + 5] = p2.z;
    for (const j = 0; j < 6; j++) geometry.angle[i6 + j] = 0;
  }
  geometry.addAttribute('position', new THREE.BufferAttribute(pos, 3));
  return geometry;
};

// 梁要素の形状データを取り出す
MeshModel.prototype.getBarGeometry = function () {
  const geometry = new THREE.BufferGeometry();
  geometry.param = [];
  geometry.dir = [];
  const elems = this.elements, bars = [], axis = [], i;
  for (i = 0; i < elems.length; i++) {
    if (elems[i].isBar) {
      bars.push(elems[i].border(i, 0));
      geometry.param.push(model.barParams[elems[i].param].section);
      axis.push(elems[i].axis);
    }
  }
  const pos = new Float32Array(6 * bars.length);
  const colors = new Float32Array(6 * bars.length);
  geometry.elements = new Int32Array(2 * bars.length);
  geometry.nodes = new Int32Array(2 * bars.length);
  geometry.angle = new Float32Array(6 * bars.length);
  for (i = 0; i < bars.length; i++) {
    const i2 = 2 * i, i6 = 6 * i, v = bars[i].nodes, elem = bars[i].element;
    const p1 = this.nodes[v[0]], p2 = this.nodes[v[1]];
    geometry.dir.push(dirVectors([p1, p2], axis[i]));
    geometry.elements[i2] = elem;
    geometry.elements[i2 + 1] = elem;
    geometry.nodes[i2] = v[0];
    geometry.nodes[i2 + 1] = v[1];
    pos[i6] = p1.x;
    pos[i6 + 1] = p1.y;
    pos[i6 + 2] = p1.z;
    pos[i6 + 3] = p2.x;
    pos[i6 + 4] = p2.y;
    pos[i6 + 5] = p2.z;
    for (const j = 0; j < 3; j++) {
      colors[i6 + j] = meshColors[j];
      colors[i6 + j + 3] = meshColors[j];
      geometry.angle[i6 + j] = 0;
      geometry.angle[i6 + j + 3] = 0;
    }
  }
  geometry.addAttribute('position', new THREE.BufferAttribute(pos, 3));
  geometry.addAttribute('color', new THREE.BufferAttribute(colors, 3));
  return geometry;
};
*/
}

//--------------------------------------------------------------------//
// 節点
// label - 節点ラベル
// x,y,z - x,y,z座標
export class FENode extends THREE.Vector3 { 

  public label: number;

  constructor(label: number, x: number, y: number, z: number) {
    super(x, y, z);
    this.label = label;
  }

  // 節点のコピーを返す
  public clone(): FENode {
    return new FENode(this.label, this.x, this.y, this.z);
  }

  // 節点を表す文字列を返す
  public toString(): string {
    return 'Node\t' + this.label.toString(10) + '\t' +
      this.x + '\t' + this.y + '\t' + this.z;
  }

}

//--------------------------------------------------------------------//
// 節点集合
// nodes - 節点番号
export class Nodes {

  public nodes: any[];
  constructor(nodes) {
    this.nodes = nodes;
  }

  // 節点数を返す
  public nodeCount(): number {
    return this.nodes.length;
  }
}

// 重心位置を返す
// p - 頂点座標
function center(p) {
  const x = 0, y = 0, z = 0, cc = 1.0 / p.length;
  for (const i = 0; i < p.length; i++) {
    x += p[i].x;
    y += p[i].y;
    z += p[i].z;
  }
  return new THREE.Vector3(cc * x, cc * y, cc * z);
}

// 法線ベクトルを返す
// p - 頂点座標
function normalVector(p) {
  if (p.length < 3) {
    return null;
  }
  else if ((p.length == 3) || (p.length == 6)) {
    return new THREE.Vector3().subVectors(p[1], p[0]).cross
      (new THREE.Vector3().subVectors(p[2], p[0])).normalize();
  }
  else if ((p.length == 4) || (p.length == 8)) {
    return new THREE.Vector3().subVectors(p[2], p[0]).cross
      (new THREE.Vector3().subVectors(p[3], p[1])).normalize();
  }
  else {
    const vx = 0, vy = 0, vz = 0;
    for (const i = 0; i < p.length; i++) {
      const p1 = p[(i + 1) % p.length], p2 = p[(i + 2) % p.length];
      const norm = new THREE.Vector3().subVectors(p1, p[i]).cross
        (new THREE.Vector3().subVectors(p2, p[i]));
      vx += norm.x;
      vy += norm.y;
      vz += norm.z;
    }
    return new THREE.Vector3(vx, vy, vz).normalize();
  }
}

// ラベルを比較する
// o1,o2 - 比較する対象
function compareLabel(o1, o2) {
  if (o1.label < o2.label) return -1;
  else if (o1.label > o2.label) return 1;
  else return 0;
}

// 行列の和を計算する
// a - 基準行列
// da - 加える行列
function addMatrix(a, da) {
  for (const i = 0; i < a.length; i++) {
    for (const j = 0; j < a[i].length; j++) {
      a[i][j] += da[i][j];
    }
  }
}

// ベクトルの和を計算する
// v - 基準ベクトル
// dv - 加えるベクトル
function addVector(v, dv) {
  for (const i = 0; i < v.length; i++) {
    v[i] += dv[i];
  }
}

