import { Injectable } from '@angular/core';
import { BoundaryCondition } from './boundary/boundary-condition.service';
import { Strain } from './stress/strain.service';
import { Stress } from './stress/stress.service';
import { Vector3R } from './load_restaint/vector3-r.service';

@Injectable({
  providedIn: 'root'
})
export class Result {

  // データ型
  public NONE=-1;		// 空データ
  public DISPLACEMENT=0;	// 変位
  public STRAIN=1;		// 歪
  public STRESS=2;		// 応力
  public S_ENERGY=3;		// 歪エネルギー密度
  public TEMPERATURE=4;	// 温度
  // 成分
  public X=0;		// x成分
  public Y=1;		// y成分
  public Z=2;		// z成分
  public RX=3;		// x軸回転成分
  public RY=4;		// y軸回転成分
  public RZ=5;		// z軸回転成分
  public XY=3;		// xyせん断成分
  public YZ=4;		// yzせん断成分
  public ZX=5;		// zxせん断成分
  public MAGNITUDE=6;	// 大きさ
  public MAX_PRINCIPAL=7;	// 最大主成分
  public MIN_PRINCIPAL=8;	// 最小主成分
  public MID_PRINCIPAL=9;	// 中間主成分
  public MAX_SHARE=10;	// 最大せん断成分
  public VON_MISES=11;	// ミーゼス応力
  public SHIFT=12;		// 成分シフト量
  // 変位の成分
  public DISP_COMPONENT=['Mag.','x','y','z'];
  public DISP2_COMPONENT=['Mag.','x','y','z','rotx','roty','rotz'];
  // 歪の成分
  public STRAIN_COMPONENT=['Max.prin.','Min.prin.','Mid.prin.',
                        'Max.share',
                        'x','y','z','xy','yz','zx'];
  // 応力の成分
  public STRESS_COMPONENT=['Max.prin.','Min.prin.','Mid.prin.',
                        'Max.share','Von mises',
                        'x','y','z','xy','yz','zx'];
  // 歪エネルギー密度の成分
  public ENERGY_COMPONENT=['Energy'];
  public COMP_MAP={'Mag.':this.MAGNITUDE,'x':this.X,'y':this.Y,'z':this.Z,
                'rotx':this.RX,'roty':this.RY,'rotz':this.RZ,'xy':this.XY,'yz':this.YZ,'zx':this.ZX,
                'Max.prin.':this.MAX_PRINCIPAL,'Min.prin.':this.MIN_PRINCIPAL,
                'Mid.prin.':this.MID_PRINCIPAL,'Max.share':this.MAX_SHARE,
                'Von mises':this.VON_MISES,'Energy':0,
                'x 1':this.X,'y 1':this.Y,'z 1':this.Z,'xy 1':this.XY,'yz 1':this.YZ,'zx 1':this.ZX,
                'Max.prin. 1':this.MAX_PRINCIPAL,'Min.prin. 1':this.MIN_PRINCIPAL,
                'Mid.prin. 1':this.MID_PRINCIPAL,'Max.share 1':this.MAX_SHARE,
                'Von mises 1':this.VON_MISES,'Energy 1':0,
                'x 2':this.X+this.SHIFT,'y 2':this.Y+this.SHIFT,'z 2':this.Z+this.SHIFT,
                'xy 2':this.XY+this.SHIFT,'yz 2':this.YZ+this.SHIFT,'zx 2':this.ZX+this.SHIFT,
                'Max.prin. 2':this.MAX_PRINCIPAL+this.SHIFT,
                'Min.prin. 2':this.MIN_PRINCIPAL+this.SHIFT,
                'Mid.prin. 2':this.MID_PRINCIPAL+this.SHIFT,
                'Max.share 2':this.MAX_SHARE+this.SHIFT,
                'Von mises 2':this.VON_MISES+this.SHIFT,'Energy 2':1};
  public EIG_EPS=1e-10;		// 固有値計算の収束閾値
  public NODE_DATA=0;		// 節点データ
  public ELEMENT_DATA=1;		// 要素データ
  public VIBRATION='Vibration';	// 振動解析
  public BUCKLING='Buckling';	// 座屈解析

  // 計算結果
  public displacement: any[]; // 変位
  public strain1: any[]; // 節点歪
  public strain2: any[];
  public stress1: any[]; // 節点応力
  public stress2: any[];
  public sEnergy1: any[]; // 節点歪エネルギー密度
  public sEnergy2: any[];
  public temperature: any[]; // 節点温度
  public dispMax: number; // 変位の大きさの最大値
  public angleMax: number; // 回転角の大きさの最大値
  public tempMax: number; // 温度の最大値
  public eigenValue: any[]; // 固有値データ
  public calculated: boolean; // 計算前＝計算結果無し
  public value: any[]; // コンター図データ
  public minValue: number;  // コンター図データ最小値
  public maxValue: number; // コンター図データ最大値
  public type: number; // データ保持形態：節点データ


  constructor() { }

  // 計算結果を消去する
  public clear(): void{
    this.displacement = new Array(); // 変位
    this.strain1 = new Array();
    this.strain2 = new Array();
    this.stress1 = new Array();
    this.stress2 = new Array();
    this.sEnergy1 = new Array();
    this.sEnergy2 = new Array();
    this.temperature = new Array();
    this.dispMax=0;
    this.angleMax=0;
    this.tempMax=0;
    this.eigenValue = new Array();
    this.calculated=false;
    this.value = new Array();
    this.minValue=0;
    this.maxValue=0;
    this.type = this.NODE_DATA;
  }


  // 節点歪・応力を初期化する
  // count - 節点数
  public initStrainAndStress(count) {
    this.strain1.length = 0;
    this.strain2.length = 0;
    this.stress1.length = 0;
    this.stress2.length = 0;
    this.sEnergy1.length = 0;
    this.sEnergy2.length = 0;
    const zeros = [0, 0, 0, 0, 0, 0];
    for (let i = 0; i < count; i++) {
      this.strain1[i] = new Strain(zeros);
      this.strain2[i] = new Strain(zeros);
      this.stress1[i] = new Stress(zeros);
      this.stress2[i] = new Stress(zeros);
      this.sEnergy1[i] = 0;
      this.sEnergy2[i] = 0;
    }
  }

  // 節点変位を設定する
  // bc - 境界条件
  // disp - 節点変位を表すベクトル
  // nodeCount - 節点数
  public setDisplacement(bc: BoundaryCondition, disp, nodeCount: number) {
    this.displacement.length = 0;
    this.dispMax = 0;
    this.angleMax = 0;
    const rests = bc.restraints;
    let ii = 0;
    for (let i = 0; i < nodeCount; i++) {
      const v = new Vector3R(0,0,0,0,0,0);
      const i0 = bc.nodeIndex[i];
      const bcDof = bc.dof[i];
      let r = -1;
      const x: number[] = v.x;
      for (let j = 0; j < bcDof; j++) {
        const bcl = bc.bcList[i0 + j];
        if (bcl < 0) {
          x[j] = disp[ii];
          ii++;
        }
        else {
          r = Math.floor(bcl / 6);
          x[j] = rests[r].x[j];
        }
      }
      if ((r >= 0) && rests[r].coords) {
        v.x = rests[r].coords.toGlobal(x);
      }
      this.dispMax = Math.max(this.dispMax, v.magnitude());
      this.angleMax = Math.max(this.angleMax, v.magnitudeR());
      this.displacement.push(v);
    }
    this.calculated = true;
  }

  // 節点の構造解析結果に値を加える
  // i - 節点のインデックス
  // eps1,str1,se1,eps2,str2,se2 - 表面・裏面の歪，応力，歪エネルギー密度
  public addStructureData(i, eps1, str1, se1,
    eps2, str2, se2) {
    this.strain1[i].add(eps1);
    this.stress1[i].add(str1);
    this.sEnergy1[i] += se1;
    this.strain2[i].add(eps2);
    this.stress2[i].add(str2);
    this.sEnergy2[i] += se2;
  }

  // 節点の構造解析結果に値を掛ける
  // i - 節点のインデックス
  // coef - 計算結果に掛ける係数
  public mulStructureData(i, coef) {
    this.strain1[i].mul(coef);
    this.stress1[i].mul(coef);
    this.sEnergy1[i] *= coef;
    this.strain2[i].mul(coef);
    this.stress2[i].mul(coef);
    this.sEnergy2[i] *= coef;
  }


/*

// 節点温度を設定する
// bc - 境界条件
// t - 節点温度を表すベクトル
// nodeCount - 節点数
public setTemperature=function(bc,t,nodeCount){
  this.temperature.length=0;
  const temp=bc.temperature,ii=0;
  for(const i=0;i<nodeCount;i++){
    const tt;
    if(bc.bcList[i]<0){
      tt=t[ii];
      ii++;
    }
    else{
      tt=temp[bc.bcList[i]].t;
    }
    this.tempMax=Math.max(this.tempMax,tt);
    this.temperature.push(tt);
  }
  this.calculated=true;
};




// 固有値データを追加する
// ev - 固有値
public addEigenValue=function(ev){
  this.eigenValue.push(ev);
  this.calculated=true;
};

// コンター図データを設定する
// param - データの種類
// component - データの成分
// data - コンター図参照元
public setContour=function(param,component,data){
  if(param<0) return;
  data=data||this;
  const dpara=[data.displacement,data.strain1,data.stress1,data.sEnergy1,
      	     data.temperature];
  const count=dpara[param].length;
  if(count===0) return;
  this.value.length=0;
  this.value[0]=data.getData(param,component,0);
  this.minValue=this.value[0];
  this.maxValue=this.value[0];
  for(const i=1;i<count;i++){
    this.value[i]=data.getData(param,component,i);
    this.minValue=Math.min(this.minValue,this.value[i]);
    this.maxValue=Math.max(this.maxValue,this.value[i]);
  }
};

// データを取り出す
// param - データの種類
// component - データの成分
// index - 節点のインデックス
public getData=function(param,component,index){
  switch(param){
    case DISPLACEMENT:
      switch(component){
      	case X:
      	case Y:
      	case Z:
      	case RX:
      	case RY:
      	case RZ:
      	  return this.displacement[index].x[component];
      	case MAGNITUDE:
      	  return this.displacement[index].magnitude();
      }
      break;
    case STRAIN:
      if(component<SHIFT){
      	return this.getTensorComp(this.strain1[index],component);
      }
      else{
      	return this.getTensorComp(this.strain2[index],component-SHIFT);
      }
      break;
    case STRESS:
      if(component<SHIFT){
      	return this.getTensorComp(this.stress1[index],component);
      }
      else{
      	return this.getTensorComp(this.stress2[index],component-SHIFT);
      }
      break;
    case S_ENERGY:
      if(component===0){
      	return this.sEnergy1[index];
      }
      else{
      	return this.sEnergy2[index];
      }
      break;
    case TEMPERATURE:
      return this.temperature[index];
  }
  return 0;
};

// 歪・応力を取り出す
// s - 歪 or 応力
// component - データの成分
public getTensorComp=function(s,component){
  if(component<6){
    return s.vector()[component];
  }
  else if(component<=10){
    const pri=s.principal();
    if(component===MAX_PRINCIPAL)      return pri[0];
    else if(component===MIN_PRINCIPAL) return pri[2];
    else if(component===MID_PRINCIPAL) return pri[1];
    else if(component===MAX_SHARE)     return 0.5*(pri[0]-pri[2]);
  }
  else if(component===VON_MISES){
    return s.mises();
  }
  return 0;
};


// データ文字列を返す
// nodes - 節点
// elems - 要素
public toStrings=function(nodes,elems){
  const s=[],tuple,i;
  if(this.type===ELEMENT_DATA){
    s.push('ResultType\tElement');
    tuple=elems;
  }
  else{
    s.push('ResultType\tNode');
    tuple=nodes;
  }
  for(i=0;i<this.displacement.length;i++){
    s.push('Displacement\t'+nodes[i].label.toString(10)+'\t'+
      	   this.displacement[i].x.join('\t'));
  }
  for(i=0;i<this.strain1.length;i++){
    s.push('Strain1\t'+tuple[i].label.toString(10)+'\t'+
      	   this.strain1[i].vector().join('\t'));
  }
  for(i=0;i<this.stress1.length;i++){
    s.push('Stress1\t'+tuple[i].label.toString(10)+'\t'+
      	   this.stress1[i].vector().join('\t'));
  }
  for(i=0;i<this.sEnergy1.length;i++){
    s.push('StrEnergy1\t'+tuple[i].label.toString(10)+'\t'+
      	   this.sEnergy1[i]);
  }
  for(i=0;i<this.strain2.length;i++){
    s.push('Strain2\t'+tuple[i].label.toString(10)+'\t'+
      	   this.strain2[i].vector().join('\t'));
  }
  for(i=0;i<this.stress2.length;i++){
    s.push('Stress2\t'+tuple[i].label.toString(10)+'\t'+
      	   this.stress2[i].vector().join('\t'));
  }
  for(i=0;i<this.sEnergy2.length;i++){
    s.push('StrEnergy2\t'+tuple[i].label.toString(10)+'\t'+
      	   this.sEnergy2[i]);
  }
  for(i=0;i<this.temperature.length;i++){
    s.push('Temp\t'+nodes[i].label.toString(10)+'\t'+
      	   this.temperature[i]);
  }
  for(i=0;i<this.eigenValue.length;i++){
    Array.prototype.push.apply
      (s,this.eigenValue[i].toStrings(nodes,tuple));
  }
  return s;
};

//--------------------------------------------------------------------//
// 固有値
// value - 固有値・固有振動数
// type - 解析種類
const EigenValue=function(value,type){
  this.value=value;
  this.type=type;
  this.displacement=[];		// 変位
  this.sEnergy1=[];		// 節点歪エネルギー密度
  this.sEnergy2=[];
  this.dispMax=0;
  this.angleMax=0;
};

// 変位を設定する
// bc - 境界条件
// disp - 変位を表す固有ベクトル
// nodeCount - 節点数
EigenValue.prototype.setDisplacement=function(bc,disp,nodeCount){
  this.displacement.length=0;
  this.dispMax=0;
  this.angleMax=0;
  const rests=bc.restraints,ii=0;
  for(const i=0;i<nodeCount;i++){
    const v=new Vector3R(),i0=bc.nodeIndex[i],bcDof=bc.dof[i],r=-1,x=v.x;
    for(const j=0;j<bcDof;j++){
      const bcl=bc.bcList[i0+j];
      if(bcl<0){
      	x[j]=disp[ii];
      	ii++;
      }
      else{
      	r=parseInt(bcl/6);
      }
    }
    if((r>=0) && rests[r].coords){
      v.x=rests[r].coords.toGlobal(x);
    }
    this.dispMax=Math.max(this.dispMax,v.magnitude());
    this.angleMax=Math.max(this.angleMax,v.magnitudeR());
    this.displacement.push(v);
  }
};

// データを取り出す
// param - データの種類
// component - データの成分
// index - 節点のインデックス
EigenValue.prototype.getData=function(param,component,index){
  switch(param){
    case DISPLACEMENT:
      switch(component){
      	case X:
      	case Y:
      	case Z:
      	case RX:
      	case RY:
      	case RZ:
      	  return this.displacement[index].x[component];
      	case MAGNITUDE:
      	  return this.displacement[index].magnitude();
      }
      break;
    case S_ENERGY:
      if(component===0){
      	return this.sEnergy1[index];
      }
      else{
      	return this.sEnergy2[index];
      }
      break;
  }
  return 0;
};

// 節点歪・応力を初期化する
// count - 節点数
EigenValue.prototype.initStrainEnergy=function(count){
  this.sEnergy1.length=0;
  this.sEnergy2.length=0;
  for(const i=0;i<count;i++){
    this.sEnergy1[i]=0;
    this.sEnergy2[i]=0;
  }
};

// データ文字列を返す
// nodes - 節点
// tuple - 節点or要素
EigenValue.prototype.toStrings=function(nodes,tuple){
  const s=[],i;
  s.push('EigenValue\t'+this.type+'\t'+this.value);
  for(i=0;i<this.displacement.length;i++){
    s.push('Displacement\t'+nodes[i].label.toString(10)+'\t'+
      	   this.displacement[i].x.join('\t'));
  }
  for(i=0;i<this.sEnergy1.length;i++){
    s.push('StrEnergy1\t'+tuple[i].label.toString(10)+'\t'+
      	   this.sEnergy1[i]);
  }
  for(i=0;i<this.sEnergy2.length;i++){
    s.push('StrEnergy2\t'+tuple[i].label.toString(10)+'\t'+
      	   this.sEnergy2[i]);
  }
  return s;
};

//--------------------------------------------------------------------//
// ３次元対称テンソル
// s - 成分
const SymmetricTensor3=function(s){
  this.xx=s[0];
  this.yy=s[1];
  this.zz=s[2];
  this.xy=s[3];
  this.yz=s[4];
  this.zx=s[5];
};

// テンソルをベクトルとして返す
SymmetricTensor3.prototype.vector=function(){
  return [this.xx,this.yy,this.zz,this.xy,this.yz,this.zx];
};

// テンソルを加える
// t - 加えるテンソル
SymmetricTensor3.prototype.add=function(t){
  this.xx+=t.xx;
  this.yy+=t.yy;
  this.zz+=t.zz;
  this.xy+=t.xy;
  this.yz+=t.yz;
  this.zx+=t.zx;
};

// 成分にスカラーを掛ける
// a - 掛けるスカラー
SymmetricTensor3.prototype.mul=function(a){
  this.xx*=a;
  this.yy*=a;
  this.zz*=a;
  this.xy*=a;
  this.yz*=a;
  this.zx*=a;
};

// 固有値を返す
SymmetricTensor3.prototype.principal=function(){
  return eigenvalue(this,100).lambda;
};

// テンソルを回転させる
// d - 方向余弦マトリックス
SymmetricTensor3.prototype.rotate=function(d){
  const mat=[[this.xx,this.xy,this.zx],[this.xy,this.yy,this.yz],
      	   [this.zx,this.yz,this.zz]];
  const s=[0,0,0,0,0,0];
  for(const i=0;i<3;i++){
    for(const j=0;j<3;j++){
      const mij=mat[i][j];
      for(const k=0;k<3;k++){
      	s[k]+=d[k][i]*d[k][j]*mij;
      	s[k+3]+=d[k][i]*d[(k+1)%3][j]*mij;
      }
    }
  }
  this.xx=s[0];
  this.yy=s[1];
  this.zz=s[2];
  this.xy=s[3];
  this.yz=s[4];
  this.zx=s[5];
};

// テンソルの内積を計算する
// t - 相手のテンソル
SymmetricTensor3.prototype.innerProduct=function(t){
  return this.xx*t.xx+this.yy*t.yy+this.zz*t.zz+
      	 2*(this.xy*t.xy+this.yz*t.yz+this.zx*t.zx);
};

// Jacobie法で対称テンソルの固有値を求める
// Numeric.jsでは対角要素が0（例えばせん断のみの条件）だと求められない
// st - 対称テンソル
// iterMax - 反復回数の最大値
function eigenvalue(st,iterMax){
  const m=[[st.xx,st.xy,st.zx],[st.xy,st.yy,st.yz],
      	 [st.zx,st.yz,st.zz]];
  return eigenByJacob(m,iterMax);
}

// Jacobie法で対称テンソルの固有値を求める
// m - 対称行列
// iterMax - 反復回数の最大値
function eigenByJacob(m,iterMax){
  const size=m.length,abs=Math.abs,i,j,iter,dataMax=0;
  const ev=numeric.identity(size);
  for(i=0;i<size;i++){
    for(j=i;j<size;j++){
      dataMax=Math.max(dataMax,abs(m[i][j]));
    }
  }
  const tolerance=EIG_EPS*dataMax;
// 値が0の場合
  if(dataMax===0) return {lambda:numeric.getDiag(m),ev:ev};
  for(iter=0;iter<iterMax;iter++){
    const im=0,jm=0,ndMax=0;
    for(i=0;i<2;i++){
      for(j=i+1;j<3;j++){
      	const absm=abs(m[i][j]);
      	if(absm>ndMax){
      	  ndMax=absm;
      	  im=i;
      	  jm=j;
      	}
      }
    }
    if(ndMax<tolerance) break;
    const mim=m[im],mjm=m[jm];
    const alpha=0.5*(mim[im]-mjm[jm]);
    const beta=0.5/Math.sqrt(alpha*alpha+ndMax*ndMax);
    const cc2=0.5+abs(alpha)*beta,cs=-beta*mim[jm];
    if(alpha<0) cs=-cs;
    const cc=Math.sqrt(cc2),ss=cs/cc;
    const aij=2*(alpha*cc2-mim[jm]*cs),aii=mjm[jm]+aij,ajj=mim[im]-aij;
    for(i=0;i<3;i++){
      const mi=m[i],evi=ev[i];
      const a1=mi[im]*cc-mi[jm]*ss;
      const a2=mi[im]*ss+mi[jm]*cc;
      mi[im]=a1;
      mi[jm]=a2;
      mim[i]=a1;
      mjm[i]=a2;
      a1=evi[im]*cc-evi[jm]*ss;
      a2=evi[im]*ss+evi[jm]*cc;
      evi[im]=a1;
      evi[jm]=a2;
    }
    mim[im]=aii;
    mim[jm]=0;
    mjm[im]=0;
    mjm[jm]=ajj;
  }
  m=numeric.getDiag(m);
// 固有値を大きい順に入れ替える
  const eig=[];
  ev=numeric.transpose(ev);
  for(i=0;i<size;i++) eig.push([m[i],ev[i]]);
  eig.sort(function(v1,v2){return v2[0]-v1[0];});
  for(i=0;i<size;i++){
    m[i]=eig[i][0];
    ev[i]=eig[i][1];
  }
  return {lambda:m,ev:numeric.transpose(ev)};
}

//--------------------------------------------------------------------//
// 歪
// s - 成分
const Strain=function(s){
  SymmetricTensor3.call(this,s);
  this.xy=0.5*s[3];
  this.yz=0.5*s[4];
  this.zx=0.5*s[5];
};

// テンソルをベクトルとして返す
Strain.prototype.vector=function(){
  return [this.xx,this.yy,this.zz,2*this.xy,2*this.yz,2*this.zx];
};

//--------------------------------------------------------------------//
// 応力
// s - 成分
const Stress=function(s){
  SymmetricTensor3.call(this,s);
};

// ミーゼス応力を返す
Stress.prototype.mises=function(){
  const dxy=this.xx-this.yy,dyz=this.yy-this.zz,dzx=this.zz-this.xx;
  const ss=dxy*dxy+dyz*dyz+dzx*dzx;
  const tt=this.xy*this.xy+this.yz*this.yz+this.zx*this.zx;
  return Math.sqrt(0.5*ss+3*tt);
};

//--------------------------------------------------------------------//
// 結果表示設定
const ResultView=function(){
  this.dispCoef=document.getElementById('dispcoef');	// 変形表示倍率
  this.eigen=document.getElementById('eigenvalue');	// 固有値データ
  this.contour=document.getElementById('contour');	// コンター図表示データ
  this.component=document.getElementById('component');	// コンター図表示成分
};

// 静解析の設定を初期化する
ResultView.prototype.setInitStatic=function(){
  removeOptions(this.eigen);
  this.setContourSelect();
  this.setConfig();
};

// 固有値解析の設定を初期化する
ResultView.prototype.setInitEigen=function(){
  removeOptions(this.eigen);
  const eigenValue=model.result.eigenValue;
  for(const i=0;i<eigenValue.length;i++){
    this.eigen.appendChild(createOption('固有値'+(i+1),i));
  }
  removeOptions(this.contour);
  this.contour.appendChild(createOption('コンター無し',NONE));
  this.contour.appendChild(createOption('変位',DISPLACEMENT));
  this.contour.appendChild(createOption('歪エネルギー密度',S_ENERGY));
  this.setResComp();
  this.setConfig();
};

// 表示するコンター図データを設定する
ResultView.prototype.setContourSelect=function(){
  removeOptions(this.eigen);
  removeOptions(this.contour);
  this.contour.appendChild(createOption('コンター無し',NONE));
  if(model.result.displacement.length>0){
    this.contour.appendChild(createOption('変位',DISPLACEMENT));
  }
  if(model.result.strain1.length>0){
    this.contour.appendChild(createOption('歪',STRAIN));
  }
  if(model.result.stress1.length>0){
    this.contour.appendChild(createOption('応力',STRESS));
  }
  if(model.result.sEnergy1.length>0){
    this.contour.appendChild(createOption('歪エネルギー密度',S_ENERGY));
  }
  if(model.result.temperature.length>0){
    this.contour.appendChild(createOption('温度',TEMPERATURE));
  }
  removeOptions(this.component);
};

// 表示成分を設定する
ResultView.prototype.setResComp=function(){
  if(!model.result.calculated) return;
  removeOptions(this.component);
  switch(parseInt(this.contour.value)){
    case DISPLACEMENT:
      if(model.hasShellBar){
      	setOptions(this.component,DISP2_COMPONENT,-1);
      }
      else{
      	setOptions(this.component,DISP_COMPONENT,-1);
      }
      break;
    case STRAIN:
      if(model.hasShellBar){
      	setOptions(this.component,STRAIN_COMPONENT,1);
      	setOptions(this.component,STRAIN_COMPONENT,2);
      }
      else{
      	setOptions(this.component,STRAIN_COMPONENT,-1);
      }
      break;
    case STRESS:
      if(model.hasShellBar){
      	setOptions(this.component,STRESS_COMPONENT,1);
      	setOptions(this.component,STRESS_COMPONENT,2);
      }
      else{
      	setOptions(this.component,STRESS_COMPONENT,-1);
      }
      break;
    case S_ENERGY:
      if(model.hasShellBar){
      	setOptions(this.component,ENERGY_COMPONENT,1);
      	setOptions(this.component,ENERGY_COMPONENT,2);
      }
      else{
      	setOptions(this.component,ENERGY_COMPONENT,-1);
      }
      break;
  }
};

// 設定を表示に反映させる
ResultView.prototype.setConfig=function(){
  const eigen=parseInt(this.eigen.value);
  const dcoef=parseFloat(this.dispCoef.value);
  const param=parseInt(this.contour.value);
  const coef,comp,minValue,maxValue;
  if(isFinite(eigen)){
    const eigenValue=model.result.eigenValue[eigen];
    coef=dcoef*Math.min(bounds.size/eigenValue.dispMax,
      	      	      	1/eigenValue.angleMax);
    viewObj.setDisplacement(eigenValue.displacement,coef);
    showEigenValue(eigen,eigenValue.type,eigenValue.value);
    if(param<0){
      viewObj.clearContour();
      colorBar.clear();
    }
    else{
      comp=parseInt(this.component.value);
      model.result.setContour(param,comp,eigenValue);
      minValue=model.result.minValue;
      maxValue=model.result.maxValue;
      switch(param){
      	case DISPLACEMENT:
      	case TEMPERATURE:
      	  viewObj.setContour(model.result.value,minValue,maxValue);
      	  break;
      	default:
      	  viewObj.setContour(model.result.value,minValue,maxValue,
      	      	      	     model.result.type);
      	  break;
      }
      colorBar.draw(minValue,maxValue);
    }
  }
  else{
    coef=dcoef*Math.min(bounds.size/model.result.dispMax,
      	      	      	1/model.result.angleMax);
    viewObj.setDisplacement(model.result.displacement,coef);
    if(param<0){
      viewObj.clearContour();
      colorBar.clear();
    }
    else{
      comp=parseInt(this.component.value);
      model.result.setContour(param,comp);
      minValue=model.result.minValue;
      maxValue=model.result.maxValue;
      switch(param){
      	case DISPLACEMENT:
      	case TEMPERATURE:
      	  viewObj.setContour(model.result.value,minValue,maxValue);
      	  break;
      	default:
      	  viewObj.setContour(model.result.value,minValue,maxValue,
      	      	      	     model.result.type);
      	  break;
      }
      colorBar.draw(minValue,maxValue);
    }
  }
};

// 設定をバックアップする
ResultView.prototype.stock=function(){
  this.coef0=this.dispCoef.value;
  this.contour0=[];
  this.comp0=[];
  const i;
  for(i=0;i<this.contour.childNodes.length;i++){
    this.contour0[i]=this.contour.childNodes[i];
  }
  this.contIndex=this.contour.selectedIndex;
  for(i=0;i<this.component.childNodes.length;i++){
    this.comp0[i]=this.component.childNodes[i];
  }
  this.compIndex=this.component.selectedIndex;
};

// 設定を元に戻す
ResultView.prototype.reset=function(){
  this.dispCoef.value=this.coef0;
  removeOptions(this.contour);
  removeOptions(this.component);
  const i;
  for(i=0;i<this.contour0.length;i++){
    this.contour.appendChild(this.contour0[i]);
  }
  this.contour.selectedIndex=this.contIndex;
  for(i=0;i<this.comp0.length;i++){
    this.component.appendChild(this.comp0[i]);
  }
  this.component.selectedIndex=this.compIndex;
};

// 計算結果の成分を表示する
// sel - コンボボックス
// component - 成分
// data - データ番号（1:表面,2:裏面,-1:番号なし）
function setOptions(sel,component,data){
  for(const i=0;i<component.length;i++){
    const c=component[i];
    if(data>0) c+=' '+data;
    sel.appendChild(createOption(c,COMP_MAP[c]));
  }
}

// オプション要素を作成する
// text - オプションのテキスト
// value - オプションの値
function createOption(text,value){
  const opt=document.createElement('option');
  opt.value=value;
  opt.text=text;
  return opt;
}

// コンボボックスのオプションを削除する
// sel - コンボボックス
function removeOptions(sel){
  if(sel.hasChildNodes()){
    while(sel.childNodes.length>0){
      sel.removeChild(sel.firstChild);
    }
  }
}

// 結果表示設定ウィンドウを表示する
function showResultWindow(){
  showModalWindow(RESULT_WINDOW);
  resultView.stock();
}

// 計算結果を消去する
function removeRes(){
  model.result.clear();
  viewObj.removeResult();
  colorBar.clear();
  showInfo();
  resultView.setContourSelect();
  hideModalWindow(RESULT_WINDOW);
}

// 結果表示設定を更新する
function setResultConfig(){
  hideModalWindow(RESULT_WINDOW);
  resultView.setConfig();
}

// 結果表示設定を取り消す
function cancelResultConfig(){
  hideModalWindow(RESULT_WINDOW);
  resultView.reset();
}

inherits(Strain,SymmetricTensor3);
inherits(Stress,SymmetricTensor3);

*/
}
