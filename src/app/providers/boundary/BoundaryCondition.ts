import { Injectable } from '@angular/core';
import { Restraint } from '../load_restaint/Restraint';

@Injectable({
  providedIn: 'root'
})
  
// 境界条件
export class BoundaryCondition {

  public restraints: Restraint[];		// 拘束条件
  public loads: any[];		// 荷重条件
  public loadMax: number;		// 最大荷重
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
    this.loadMax = 0;
  }

  // 境界条件を初期化する
  public init() {
    this.restraints.sort(this.compareNodeLabel);
    this.loads.sort(this.compareNodeLabel);
    console.log(this.loads);
    this.loadMax = 0;
    for (let i = 0; i < this.loads.length; i++) {
      this.loadMax = Math.max(this.loadMax, this.loads[i].magnitude());
    }
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
}


