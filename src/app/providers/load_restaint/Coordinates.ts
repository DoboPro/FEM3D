import { Injectable } from '@angular/core';
import * as THREE from 'three';

@Injectable({
  providedIn: 'root',
})

// 局所座標系
export class Coordinates {
  public label: number; // 座標系ラベル
  public c: THREE.Matrix3;

  // label - 座標系ラベル
  // n11,n12,n13,n21,n22,n23,n31,n32,n33 - 座標変換マトリクスの成分
  constructor(
    label: number,
    n11: number,
    n12: number,
    n13: number,
    n21: number,
    n22: number,
    n23: number,
    n31: number,
    n32: number,
    n33: number
  ) {
    this.label = label;
    this.c = new THREE.Matrix3().set(
      n11,
      n12,
      n13,
      n21,
      n22,
      n23,
      n31,
      n32,
      n33
    );
  }

  // グローバル座標系に変換する
  // x - ベクトル成分
  public toGlobal(x) {
    const y = [];
    const e = this.c.elements;
    for (var i = 0; i < 3; i++) {
      y[i] = e[i] * x[0] + e[i + 3] * x[1] + e[i + 6] * x[2];
      y[i + 3] = e[i] * x[3] + e[i + 3] * x[4] + e[i + 6] * x[5];
    }
    return y;
  }

  // 荷重ベクトルを変換する
  // vector - 荷重ベクトル
  // dof - マトリクスの自由度
  // idx0 - 節点ポインタ
  // ndof - 節点自由度
  public transVector(
    vector: number[],
    dof: number,
    idx0: number,
    ndof: number
  ): void {
    const e: number[] = this.c.elements;
    for (let j = idx0; j < idx0 + ndof; j += 3) {
      const x1 = vector[j];
      const x2 = vector[j + 1];
      const x3 = vector[j + 2];
      vector[j] = e[0] * x1 + e[1] * x2 + e[2] * x3;
      vector[j + 1] = e[3] * x1 + e[4] * x2 + e[5] * x3;
      vector[j + 2] = e[6] * x1 + e[7] * x2 + e[8] * x3;
    }
  }

  // 剛性マトリクスを変換する
  // matrix - 剛性マトリクス
  // dof - マトリクスの自由度
  // idx0 - 節点ポインタ
  // ndof - 節点自由度
  public transMatrix(
    matrix: number[][],
    dof: number,
    idx0: number,
    ndof: number
  ): void {
    const e: number[] = this.c.elements;

    let mi1: number[];
    let mi2: number[];
    let mi3: number[];
    for (let i = 0; i < dof; i += 3) {
      mi1 = matrix[i];
      mi2 = matrix[i + 1];
      mi3 = matrix[i + 2];
      for (let j = idx0; j < idx0 + ndof; j += 3) {
        if (j in matrix[i]) {
          const me = [
            mi1[j],
            mi2[j],
            mi3[j],
            mi1[j + 1],
            mi2[j + 1],
            mi3[j + 1],
            mi1[j + 2],
            mi2[j + 2],
            mi3[j + 2],
          ];
          for (let k = 0; k < 3; k++) {
            const ke3: number = 3 * k;
            const e1: number = e[ke3];
            const e2: number = e[ke3 + 1];
            const e3: number = e[ke3 + 2];
            mi1[j + k] = me[0] * e1 + me[3] * e2 + me[6] * e3;
            mi2[j + k] = me[1] * e1 + me[4] * e2 + me[7] * e3;
            mi3[j + k] = me[2] * e1 + me[5] * e2 + me[8] * e3;
          }
        }
      }
    }
    for (let i = idx0; i < idx0 + ndof; i += 3) {
      mi1 = matrix[i];
      mi2 = matrix[i + 1];
      mi3 = matrix[i + 2];
      for (let j = 0; j < dof; j += 3) {
        if (j in matrix[i]) {
          const me = [
            mi1[j],
            mi2[j],
            mi3[j],
            mi1[j + 1],
            mi2[j + 1],
            mi3[j + 1],
            mi1[j + 2],
            mi2[j + 2],
            mi3[j + 2],
          ];
          for (let k = 0; k < 3; k++) {
            const km3 = 3 * k;
            const me1 = me[km3];
            const me2 = me[km3 + 1];
            const me3 = me[km3 + 2];
            mi1[j + k] = e[0] * me1 + e[1] * me2 + e[2] * me3;
            mi2[j + k] = e[3] * me1 + e[4] * me2 + e[5] * me3;
            mi3[j + k] = e[6] * me1 + e[7] * me2 + e[8] * me3;
          }
        }
      }
    }
  }
}
