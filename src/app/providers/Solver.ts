import { Injectable } from '@angular/core';

import { BoundaryCondition } from './boundary/BoundaryCondition';
import { FemDataModel } from './FemDataModel';
import { Result } from './Result';
import { MeshModel } from './mesh/MeshModel';

import * as numeric from './libs/numeric-1.2.6.min.js';
import { View } from './View';
import { Bounds } from './Bounds';

import { ThreeService } from '../components/three/three.service';

@Injectable({
  providedIn: 'root',
})

// 連立方程式求解オブジェクト
export class Solver {
  public PRECISION = 1e-10; // マトリックス精度
  public LU_METHOD = 0; // LU分解法
  public ILUCG_METHOD = 1; // 不完全LU分解共役勾配法

  public ILUCG_THRES = 1e-10; // 不完全LU分解共役勾配法の収束閾値のデフォルト値

  public matrix: any[]; // 行列
  public matrix2: any[]; // 第２行列
  public vector: any[]; // ベクトル
  public dof: number; // モデル自由度
  public method: number; // 方程式解法

  public d: number;
  public coef: number;

  constructor(
    private model: FemDataModel,
    private view: View,
    private result: Result,
    private bounds: Bounds,
    private three: ThreeService
  ) {
    this.clear();
    // this.method = this.LU_METHOD; //直接解法
    this.method = this.ILUCG_METHOD; //反復解法
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
      const dcoef = 1; //10;
      const dispMax = this.result.dispMax;
      const angleMax = this.result.angleMax;
      const coef = dcoef * Math.min(this.bounds.size / dispMax, 1 / angleMax);
      this.view.setDisplacement(disp, coef);
      this.three.ChangeMode('disp');
      console.log('Calculation time:' + (t1 - t0) + 'ms');
    } catch (ex) {
      alert(ex);
    }
  }

  //コンター
  public conterStart() {
    try {
      const disp = 0;
      this.result.setConfig('0', '6');
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
    return this.solveILU(
      this.toSparse(this.matrix),
      this.getILU(this.matrix),
      this.vector
    );
  }
  // 反復解法（不完全LU分解共役勾配法）

  // 不完全LU分解をする
  // a - 行列
  public getILU(a) {
    var m = a.length,
      i,
      j,
      diag = [],
      col = [],
      val = [],
      d = [],
      colData = [];
    for (i = 0; i < m; i++) {
      col[i] = [];
      val[i] = [];
      diag[i] = -1;
      colData[i] = [];
    }
    // 列からの検索用ポインタを設定する
    for (i = 0; i < m; i++) {
      var arow = a[i];
      var cols = [];
      for (j in arow) {
        if (arow.hasOwnProperty(j)) {
          cols.push(parseInt(j));
        }
      }
      cols.sort(function (c1, c2) {
        return c1 - c2;
      });
      for (j = 0; j < cols.length; j++) {
        var cj = cols[j];
        if (cj === i) {
          diag[i] = j;
          d[cj] = colData[cj].length;
        }
        col[i].push(cj);
        val[i].push(arow[cj]);
        colData[cj].push(i);
      }
    }
    // 不完全LU分解をする
    for (var k = 0; k < m - 1; k++) {
      var vk = val[k],
        ck = col[k],
        dk = diag[k],
        cdk = colData[k];
      if (dk < 0 || vk[dk] === 0) throw new Error('対角成分が0です');
      var dkk = 1 / vk[dk];
      for (j = dk + 1; j < ck.length; j++) {
        vk[j] *= dkk;
      }
      var i0 = d[k] + 1,
        i1 = cdk.length;
      for (i = i0; i < i1; i++) {
        var row = cdk[i],
          vrow = val[row],
          crow = col[row];
        var c = crow.indexOf(k);
        if (c >= 0) {
          var vik = -vrow[c];
          for (j = dk + 1; j < ck.length; j++) {
            c = crow.indexOf(ck[j]);
            if (c >= 0) {
              vrow[c] += vik * vk[j];
            }
          }
        }
      }
    }
    var rowData = [],
      valData = [],
      count = 0;
    colData.length = 0;
    rowData.push(count);
    for (i = 0; i < m; i++) {
      diag[i] += count;
      count += col[i].length;
      rowData.push(count);
      Array.prototype.push.apply(colData, col[i]);
      Array.prototype.push.apply(valData, val[i]);
      valData[diag[i]] = 1 / valData[diag[i]];
    }
    return [rowData, colData, valData, diag];
  }

  // LU分解法で連立方程式の解を求める
  // lu - LU分解した疎行列
  // p - ベクトル
  public solveLU(lu, p) {
    var row = lu[0],
      col = lu[1],
      val = lu[2],
      diag = lu[3],
      m = row.length - 1;
    var q = [],
      i,
      j,
      j1;
    q[0] = p[0] * val[diag[0]];
    for (i = 1; i < m; i++) {
      var p2 = p[i],
        j0 = row[i];
      j1 = diag[i];
      for (j = j0; j < j1; j++) {
        p2 -= val[j] * q[col[j]];
      }
      q[i] = p2 * val[j1];
    }
    for (i = m - 2; i >= 0; i--) {
      j1 = diag[i] + 1;
      var q2 = q[i],
        j2 = row[i + 1];
      for (j = j1; j < j2; j++) {
        q2 -= val[j] * q[col[j]];
      }
      q[i] = q2;
    }
    return q;
  }

  // 不完全LU分解共役勾配法で連立方程式の解を求める
  // matrix - 元の行列
  // ilu - 不完全LU分解した疎行列
  // p - ベクトル
  // iterMax - 反復回数の上限
  // thres - 収束閾値
  public solveILU(matrix, ilu, p) {
    const iterMax =  p.length;
    const thres =  this.ILUCG_THRES;
    var x = numeric.rep([p.length], 0),
      xg = p.concat();
    var xq = this.solveLU(ilu, xg);
    var xd = xq.concat(),
      j;
    for (var iter = 0; iter < iterMax; iter++) {
      var z1 = numeric.dotVV(xd, xg);
      xq = this.sparseDotMV(matrix, xd);
      var r = numeric.dotVV(xd, xq);
      if (Math.abs(r) === 0) {
        throw new Error('方程式求解エラー at iter=' + iter);
      }
      var alpha = z1 / r;
      for (j = 0; j < xg.length; j++) {
        x[j] += alpha * xd[j];
        xg[j] -= alpha * xq[j];
      }
      if (numeric.dotVV(xg, xg) < thres) return x;
      var xq2 = this.solveLU(ilu, xg);
      var z2 = numeric.dotVV(xq, xq2);
      var beta = -z2 / r;
      for (j = 0; j < xg.length; j++) {
        xd[j] = beta * xd[j] + xq2[j];
      }
    }
    return x;
  }

  // 行列とベクトルの積を計算する
  // matrix - 疎行列
  // x - ベクトル
  public sparseDotMV(matrix, x) {
    var row = matrix[0],
      col = matrix[1],
      val = matrix[2],
      m = row.length - 1,
      y = [];
    for (var i = 0; i < m; i++) {
      var y0 = 0,
        j0 = row[i],
        j1 = row[i + 1];
      for (var j = j0; j < j1; j++) {
        y0 += val[j] * x[col[j]];
      }
      y[i] = y0;
    }
    return y;
  }

  // 行ベースの疎行列に変換する
  // a - 元の行列
  public toSparse(a) {
    var m = a.length,
      count = 0,
      row = [],
      col = [],
      val = [],
      j;
    row.push(count);
    for (var i = 0; i < m; i++) {
      var arow = a[i];
      var cols = [];
      for (j in arow) {
        if (arow.hasOwnProperty(j)) {
          cols.push(parseInt(j));
        }
      }
      cols.sort(function (c1, c2) {
        return c1 - c2;
      });
      count += cols.length;
      row.push(count);
      Array.prototype.push.apply(col, cols);
      for (j = 0; j < cols.length; j++) {
        val.push(arow[cols[j]]);
      }
    }
    return [row, col, val];
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
}
