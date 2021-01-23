import { Injectable } from '@angular/core';
import * as THREE from '../libs/three.min.js';
import * as numeric from '../libs/numeric-1.2.6.min.js';

import { Comon } from '../Comon';
import { FENode } from '../mesh/FENode.js';

@Injectable({
  providedIn: 'root'
})
//--------------------------------------------------------------------//
// 要素
// label - 要素ラベル
// material - 材料のインデックス
// nodes - 節点番号
export class FElement extends Comon {
  
  // 三角形2次要素のガウス積分の積分点座標
  public GTRI2 = [1 / 6, 2 / 3];
  // 四面体2次要素のガウス積分の積分点座標
  public GTETRA2 = [0.25 - 0.05 * Math.sqrt(5), 0.25 + 0.15 * Math.sqrt(5)];
  // 四角形2次要素のガウス積分の積分点座標
  public GX3 = [-Math.sqrt(0.6), 0, Math.sqrt(0.6)];
  // ガウス積分の重み係数
  public GW3 = [5 / 9, 8 / 9, 5 / 9];
  public C1_6 = 1 / 6;
  public C1_12 = 1 / 12;
  public C1_24 = 1 / 24;	// 1/3,1/6,1/12,1/24

  public label: number;
  public material: number;
  public isShell: boolean;
  public isBar: boolean;
  public nodes: any[];

  constructor(label: number, material: number, nodes: number[]) {
    super();
    this.nodes = nodes;
    this.label = label;
    this.material = material;
    this.isShell = false;		// シェル要素ではない
    this.isBar = false;		// 梁要素ではない
  }

  // 節点を入れ替える
  // i1,i2 - 節点インデックス
  public swap(nodes, i1, i2){
    const t=nodes[i1];
    nodes[i1]=nodes[i2];
    nodes[i2]=t;
  }


  // 方向余弦マトリックスを返す
  // p - 頂点座標
  // axis - 断面基準方向ベクトル
  public dirMatrix(p, axis = null): number[][] {
    const v: any[] = this.dirVectors(p, axis);
    return [
      [v[0].x, v[1].x, v[2].x],
      [v[0].y, v[1].y, v[2].y],
      [v[0].z, v[1].z, v[2].z]
    ];
  }


  // 方向余弦マトリックスを返す
  // p - 頂点座標
  // axis - 断面基準方向ベクトル
  public dirVectors(p: any[], axis): any[] {
    // let v1, v2, v3;
    /*
    if (p.length == 2) {		// 梁要素
      v1 = p[1].clone().sub(p[0]).normalize();
      v2 = new THREE.Vector3();
      v3 = new THREE.Vector3();
      if ((axis !== null) && (axis !== undefined)) {
        const dt = v1.dot(axis);
        v2.set(axis.x - dt * v1.x, axis.y - dt * v1.y, axis.z - dt * v1.z);
        if (v2.lengthSq() > 0) v2.normalize();
      }
      if (v2.lengthSq() === 0) {
        if (Math.abs(v1.x) < Math.abs(v1.y)) {
          v2.set(1 - v1.x * v1.x, -v1.x * v1.y, -v1.x * v1.z).normalize();
        }
        else {
          v2.set(-v1.y * v1.x, 1 - v1.y * v1.y, -v1.y * v1.z).normalize();
        }
      }
      v3.crossVectors(v1, v2);
      return [v1, v2, v3];
    }
    else if (p.length > 2) {		// シェル要素
    */
    const v3: THREE.Vector3 = this.normalVector(p);
    let  v2 = p[1].clone().sub(p[0]);
    v2 = v3.clone().cross(v2).normalize();
    const v1 = v2.clone().cross(v3);
    return [v1, v2, v3];
    /*
    }
    return null;
    */
  }


  // 積分点の剛性マトリックスを返す
  // d - 応力-歪マトリックス
  // b - 歪-変位マトリックスの転置行列
  // coef - 係数
  public stiffPart(d, b, coef) {
    const size1 = b.length;
    const size2 = d.length;
    const a = [];
    const k = [];
    for (let i = 0; i < size1; i++) {
      a.length = 0;
      const bi = b[i];
      for (let j = 0; j < size2; j++) {
        a[j] = coef * numeric.dotVV(bi, d[j]);
      }
      const ki = [];
      for (let j = 0; j < size1; j++) {
        ki[j] = numeric.dotVV(a, b[j]);
      }
      k[i] = ki;
    }
    return k;
  }

  // 行列の和を計算する
  // a - 基準行列
  // da - 加える行列
  public addMatrix(a, da) {
    for (let i = 0; i < a.length; i++) {
      for (let j = 0; j < a[i].length; j++) {
        a[i][j] += da[i][j];
      }
    }
  }

  // 剛性マトリックスの方向を修正する
  // d - 方向余弦マトリックス
  // k - 剛性マトリックス
  public toDir(d, k) {
    const a = numeric.dot(d, k);
    for (let i = 0; i < k.length; i++) {
      const ki = k[i], ai = a[i];
      for (let j = 0; j < ki.length; j++) {
        ki[j] = numeric.dotVV(ai, d[j]);
      }
    }
  }


  // 節点変位を1次元配列に変換する
  // u - 節点変位
  // dof - 節点自由度
  public toArray(u, dof, count) {
    const  v = [];
    for (let i = 0; i < count; i++) {
      const ux = u[i].x;
      for (let j = 0; j < dof; j++) {
        v.push(ux[j]);
      }
    }
    return v;
  }


  // 剛性マトリックスの方向を修正する
  // d - 方向余弦マトリックス
  // k - 剛性マトリックス
  public toDir3(d, k) {
    const a = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
    let ai: number[];
    for (let i = 0; i < k.length; i += 3) {
      for (let j = 0; j < k[i].length; j += 3) {
        for (let i1 = 0; i1 < 3; i1++) {
          ai = a[i1];
          const di = d[i1];
          for (let j1 = 0; j1 < 3; j1++) {
            let s = 0;
            for (let ii = 0; ii < 3; ii++) {
              s += di[ii] * k[i + ii][j + j1];
            }
            ai[j1] = s;
          }
        }
        for (let i1 = 0; i1 < 3; i1++) {
          ai = a[i1];
          const ki = k[i + i1];
          for (let j1 = 0; j1 < 3; j1++) {
            ki[j + j1] = numeric.dotVV(ai, d[j1]);
          }
        }
      }
    }
  }


  // 平面上の角度を求める
  // p0 - 基点
  // p1,p2 - 頂点
  public planeAngle(p0, p1, p2) {
    const v1 = p1.clone().sub(p0).normalize();
    const v2 = p2.clone().sub(p0).normalize();
    return Math.acos(Math.min(Math.max(v1.dot(v2), 0), 1));
  }

  
  /*
  // 要素境界を返す
  // element - 要素ラベル
  public borders(element) {
    const count = this.borderCount(), borders = [];
    for (let i = 0; i < count; i++) borders[i] = this.border(element, i);
    return borders;
  }



  // 節点変位を局所座標系・1次元配列に変換する
  // u - 節点変位
  // d - 方向余弦マトリックス
  public toLocalArray(u, d) {
    const v = [], j;
    for (let i = 0; i < 2; i++) {
      const ux = u[i].x;
      for (j = 0; j < 3; j++) {
        v.push(d[0][j] * ux[0] + d[1][j] * ux[1] + d[2][j] * ux[2]);
      }
      for (j = 0; j < 3; j++) {
        v.push(d[0][j] * ux[3] + d[1][j] * ux[4] + d[2][j] * ux[5]);
      }
    }
    return v;
  }

  // 節点を入れ替える
  // i1,i2 - 節点インデックス
  public swap(nodes, i1, i2) {
    const t = nodes[i1];
    nodes[i1] = nodes[i2];
    nodes[i2] = t;
  }


  // 三角形の立体角を球面過剰から求める
  // p0 - 基点
  // p1,p2,p3 - 頂点
  public solidAngle(p0, p1, p2, p3) {
    const v1 = p1.clone().sub(p0);
    const v2 = p2.clone().sub(p0);
    const v3 = p3.clone().sub(p0);
    const v12 = v1.clone().cross(v2).normalize();
    const v23 = v2.clone().cross(v3).normalize();
    const v31 = v3.clone().cross(v1).normalize();
    const max = Math.max, min = Math.min, acos = Math.acos;
    const a1 = max(min(-v12.dot(v31), 1), -1);
    const a2 = max(min(-v23.dot(v12), 1), -1);
    const a3 = max(min(-v31.dot(v23), 1), -1);
    return acos(a1) + acos(a2) + acos(a3) - Math.PI;
  }




  */

}
