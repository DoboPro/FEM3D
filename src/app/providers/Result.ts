import { Injectable } from '@angular/core';
import { BoundaryCondition } from './boundary/BoundaryCondition';
import { Strain } from './stress/Strain';
import { Stress } from './stress/Stress';
import { Vector3R } from './load_restaint/Vector3R';
import { View } from './View';
import { Bounds } from './Bounds';

@Injectable({
  providedIn: 'root',
})
export class Result {
  // データ型
  public NONE = -1; // 空データ
  public DISPLACEMENT = 0; // 変位
  public STRAIN = 1; // 歪
  public STRESS = 2; // 応力
  public S_ENERGY = 3; // 歪エネルギー密度
  public TEMPERATURE = 4; // 温度
  // 成分
  public X = 0; // x成分
  public Y = 1; // y成分
  public Z = 2; // z成分
  public RX = 3; // x軸回転成分
  public RY = 4; // y軸回転成分
  public RZ = 5; // z軸回転成分
  public XY = 3; // xyせん断成分
  public YZ = 4; // yzせん断成分
  public ZX = 5; // zxせん断成分
  public MAGNITUDE = 6; // 大きさ
  public MAX_PRINCIPAL = 7; // 最大主成分
  public MIN_PRINCIPAL = 8; // 最小主成分
  public MID_PRINCIPAL = 9; // 中間主成分
  public MAX_SHARE = 10; // 最大せん断成分
  public VON_MISES = 11; // ミーゼス応力
  public SHIFT = 12; // 成分シフト量
  // 変位の成分
  public DISP_COMPONENT = ['Mag.', 'x', 'y', 'z'];
  public DISP2_COMPONENT = ['Mag.', 'x', 'y', 'z', 'rotx', 'roty', 'rotz'];
  // 歪の成分
  public STRAIN_COMPONENT = [
    'Max.prin.',
    'Min.prin.',
    'Mid.prin.',
    'Max.share',
    'x',
    'y',
    'z',
    'xy',
    'yz',
    'zx',
  ];
  // 応力の成分
  public STRESS_COMPONENT = [
    'Max.prin.',
    'Min.prin.',
    'Mid.prin.',
    'Max.share',
    'Von mises',
    'x',
    'y',
    'z',
    'xy',
    'yz',
    'zx',
  ];
  // 歪エネルギー密度の成分
  public ENERGY_COMPONENT = ['Energy'];
  public COMP_MAP = {
    'Mag.': this.MAGNITUDE,
    x: this.X,
    y: this.Y,
    z: this.Z,
    rotx: this.RX,
    roty: this.RY,
    rotz: this.RZ,
    xy: this.XY,
    yz: this.YZ,
    zx: this.ZX,
    'Max.prin.': this.MAX_PRINCIPAL,
    'Min.prin.': this.MIN_PRINCIPAL,
    'Mid.prin.': this.MID_PRINCIPAL,
    'Max.share': this.MAX_SHARE,
    'Von mises': this.VON_MISES,
    Energy: 0,
    'x 1': this.X,
    'y 1': this.Y,
    'z 1': this.Z,
    'xy 1': this.XY,
    'yz 1': this.YZ,
    'zx 1': this.ZX,
    'Max.prin. 1': this.MAX_PRINCIPAL,
    'Min.prin. 1': this.MIN_PRINCIPAL,
    'Mid.prin. 1': this.MID_PRINCIPAL,
    'Max.share 1': this.MAX_SHARE,
    'Von mises 1': this.VON_MISES,
    'Energy 1': 0,
    'x 2': this.X + this.SHIFT,
    'y 2': this.Y + this.SHIFT,
    'z 2': this.Z + this.SHIFT,
    'xy 2': this.XY + this.SHIFT,
    'yz 2': this.YZ + this.SHIFT,
    'zx 2': this.ZX + this.SHIFT,
    'Max.prin. 2': this.MAX_PRINCIPAL + this.SHIFT,
    'Min.prin. 2': this.MIN_PRINCIPAL + this.SHIFT,
    'Mid.prin. 2': this.MID_PRINCIPAL + this.SHIFT,
    'Max.share 2': this.MAX_SHARE + this.SHIFT,
    'Von mises 2': this.VON_MISES + this.SHIFT,
    'Energy 2': 1,
  };
  public EIG_EPS = 1e-10; // 固有値計算の収束閾値
  public NODE_DATA = 0; // 節点データ
  public ELEMENT_DATA = 1; // 要素データ
  public VIBRATION = 'Vibration'; // 振動解析
  public BUCKLING = 'Buckling'; // 座屈解析

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
  public minValue: number; // コンター図データ最小値
  public maxValue: number; // コンター図データ最大値
  public type: number; // データ保持形態：節点データ

  // カンタ―
  public contour: string = '0';
  public component: string = '6';
  public dispCoef: string;

  constructor(private view: View) {}

  // 計算結果を消去する
  public clear(): void {
    this.displacement = new Array(); // 変位
    this.strain1 = new Array();
    this.strain2 = new Array();
    this.stress1 = new Array();
    this.stress2 = new Array();
    this.sEnergy1 = new Array();
    this.sEnergy2 = new Array();
    this.temperature = new Array();
    this.dispMax = 0;
    this.angleMax = 0;
    this.tempMax = 0;
    this.eigenValue = new Array();
    this.calculated = false;
    this.value = new Array();
    this.minValue = 0;
    this.maxValue = 0;
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
      const v = new Vector3R(0, 0, 0, 0, 0, 0);
      const i0 = bc.nodeIndex[i];
      const bcDof = bc.dof[i];
      let r = -1;
      const x: number[] = v.x;
      for (let j = 0; j < bcDof; j++) {
        const bcl = bc.bcList[i0 + j];
        if (bcl < 0) {
          x[j] = disp[ii];
          ii++;
        } else {
          r = Math.floor(bcl / 6);
          x[j] = rests[r].x[j];
        }
      }
      if (r >= 0 && rests[r].coords) {
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
  public addStructureData(i, eps1, str1, se1, eps2, str2, se2) {
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

  // 設定を表示に反映させる
  setConfig(contour, component) {
    const param = parseInt(contour);
    const comp = parseInt(component);

    this.setContour(param, comp, 0);
    this.minValue = this.minValue;
    this.maxValue = this.maxValue;
    switch (param) {
      case this.DISPLACEMENT:
      case this.TEMPERATURE:
        this.view.setContour(this.value, this.minValue, this.maxValue);
        break;
      default:
        console.log('da');
        this.view.setContour(this.value, this.minValue, this.maxValue);
        break;
    }
  }

  // コンター図データを設定する
  // param - データの種類
  // component - データの成分
  // data - コンター図参照
  setContour(param, component, data) {
    if (param < 0) return;
    data = data || this;
    const dpara = [
      data.displacement,
      data.strain1,
      data.stress1,
      data.sEnergy1,
      data.temperature,
    ];
    const count = dpara[param].length;
    if (count === 0) return;
    this.value.length = 0;
    this.value[0] = data.getData(param, component, 0);
    this.minValue = this.value[0];
    this.maxValue = this.value[0];
    for (let i = 1; i < count; i++) {
      this.value[i] = data.getData(param, component, i);
      this.minValue = Math.min(this.minValue, this.value[i]);
      this.maxValue = Math.max(this.maxValue, this.value[i]);
    }
  }

  // データを取り出す
  // param - データの種類
  // component - データの成分
  // index - 節点のインデックス
  public getData = function (param, component, index) {
    switch (param) {
      case this.DISPLACEMENT:
        switch (component) {
          case this.X:
          case this.Y:
          case this.Z:
          case this.RX:
          case this.RY:
          case this.RZ:
            return this.displacement[index].x[component];
          case this.MAGNITUDE:
            return this.displacement[index].magnitude();
        }
        break;
      case this.TEMPERATURE:
        return this.temperature[index];
    }
    return 0;
  };
}
