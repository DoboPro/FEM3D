import { Injectable } from '@angular/core';
import { Restraint } from '../load_restaint/Restraint';

@Injectable({
  providedIn: 'root'
})
  
// 境界条件
export class BoundaryCondition {

  public restraints: Restraint[];		// 拘束条件
  public loads: any[];		// 荷重条件
  // public pressures: any[];		// 面圧条件
  // public temperature: any[];		// 節点温度条件
  // public htcs: any[];			// 熱伝達境界条件
  public loadMax: number;		// 最大荷重
  // public pressMax: number;		// 最大面圧
  public dof: any[];			// 節点の自由度
  public nodeIndex: any[];		// 荷重ベクトルの節点ポインタ
  public bcList: number[];		// 境界条件を設定した節点のリスト


  constructor() {
    this.dof = new Array();
    this.nodeIndex = new Array();
    this.bcList = new Array();
  }

  // データを消去する
  public clear(): void {
    this.restraints = new Array();
    this.loads = new Array();
    // this.pressures = new Array();
    // this.temperature = new Array();
    // this.htcs = new Array();
    this.loadMax = 0;
    // this.pressMax = 0;
  }

  // 境界条件を初期化する
  public init() {
    this.restraints.sort(this.compareNodeLabel);
    this.loads.sort(this.compareNodeLabel);
    console.log(this.loads);
    // this.pressures.sort(this.compareElementLabel);
    // this.temperature.sort(this.compareNodeLabel);
    // this.htcs.sort(this.compareElementLabel);
    this.loadMax = 0;
    // this.pressMax = 0;
    for (let i = 0; i < this.loads.length; i++) {
      this.loadMax = Math.max(this.loadMax, this.loads[i].magnitude());
    }
    // for (let i = 0; i < this.pressures.length; i++) {
    //   this.pressMax = Math.max(this.pressMax, this.pressures[i].press);
    // }
  }

  // 節点ラベルを比較する
  // bc1,bc2 - 比較する境界条件
  public compareNodeLabel(bc1: any, bc2: any): number {
    if (bc1.node < bc2.node) {
      return -1;
    } else if (bc1.node > bc2.node) {
      return 1;
    } else {
      return 0;
    }
  }

  // 構造解析の節点ポインタを設定する
  // count - 節点数
  public setPointerStructure(count: number): number {
    this.nodeIndex = new Array();
    this.bcList = new Array();
    let dofAll = 0;
    for (let i = 0; i < count; i++) {
      this.nodeIndex[i] = dofAll;
      dofAll += this.dof[i];
    }
    for (let i = 0; i < dofAll; i++) {
      this.bcList[i] = -1;
    }
    for (let i = 0; i < this.restraints.length; i++) {
      const r: any = this.restraints[i];
      let index0: number = this.nodeIndex[r.node];
      const rdof: number = this.dof[r.node];
      for (let j = 0; j < rdof; j++) {
        if (r.rest[j]) {
          this.bcList[index0 + j] = 6 * i + j;
        }
      }
    }
    return dofAll;
  }

  // 強制変位を返す
  // bc - 変位自由度ポインタ
  public getRestDisp(bc: number) {
    return this.restraints[parseInt((bc / 6).toString())].x[bc % 6];
  }


  /*
  // 要素ラベルを比較する
  // bc1,bc2 - 比較する境界条件
  public compareElementLabel(bc1: any, bc2: any): number {
    if (bc1.element < bc2.element) {
      return -1;
    } else if (bc1.element > bc2.element) {
      return 1;
    } else {
      return 0;
    }
  }

  // 熱解析の節点ポインタを設定する
  // count - 節点数
  public setPointerHeat(count: number): number {
    this.dof = new Array();
    this.nodeIndex = new Array();
    this.bcList = new Array();
    const temps: number = this.temperature.length;
    for (let i = 0; i < count; i++) {
      this.bcList[i] = -1;
    }
    for (let i = 0; i < temps; i++) {
      const t = this.temperature[i];
      this.bcList[t.node] = i;
    }
    return temps;
  }

  // データ文字列を返す
  // nodes - 節点
  // elems - 要素
  public toStrings(nodes, elems): string[] {
    const s: string[] = new Array();
    for (let i = 0; i < this.restraints.length; i++) {
      s.push(this.restraints[i].toString(nodes));
    }
    for (let i = 0; i < this.loads.length; i++) {
      s.push(this.loads[i].toString(nodes));
    }
    for (let i = 0; i < this.pressures.length; i++) {
      s.push(this.pressures[i].toString(elems));
    }
    for (let i = 0; i < this.temperature.length; i++) {
      s.push(this.temperature[i].toString(nodes));
    }
    for (let i = 0; i < this.htcs.length; i++) {
      s.push(this.htcs[i].toString(elems));
    }
    return s;
  }





  */
}


