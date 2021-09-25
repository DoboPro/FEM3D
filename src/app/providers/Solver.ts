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
  public PRECISION = 1e-10; // マトリクス精度
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
      //　計算にかかる時間の計測（データ不足で計算できない場合はalertメッセージを出す）
      const t0 = new Date().getTime();
      let calc = false;
      if (this.model.bc.restraints.length > 0) {
        // モデルの自由度を調べる
        this.dof = this.model.setNodeDoF();
        // dofAllを求めた後、剛性マトリクス・荷重ベクトルを作成する
        this.createStiffnessMatrix();
        // 変位を求める
        this.d = this.solve();
        this.result.setDisplacement(
          this.model.bc,
          this.d,
          this.model.mesh.nodes.length
        );
        // if (this.result.type === this.result.ELEMENT_DATA) {
        //   this.model.calculateElementStress();
        // } else {
        //   this.model.calculateNodeStress();
        // }
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

  // 剛性マトリクス・荷重ベクトルを作成する
  public createStiffnessMatrix(): void {
    const bc: BoundaryCondition = this.model.bc;
    // 自由度を減らすための準備（境界条件を設定した節点のリストを定義する）
    const bcList = bc.bcList;
    // 自由度が0である点を取り除きたい
    const reducedList = new Array();
    for (let i = 0; i < bcList.length; i++) {
      if (bcList[i] < 0) {
        reducedList.push(i);
      }
    }
    // 変位が0でない節点をreducedListに入れる。

    // 要素・全体剛性マトリクスの作成
    const matrix1: number[][] = this.stiffnessMatrix(this.dof); //dofは自由度
    // matrix1には自由度を減らしていない全体剛性マトリクスが生成

    // 荷重ベクトルの作成
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

  // 要素・全体剛性マトリクスを作成する
  // dof - モデル自由度
  public stiffnessMatrix(dof) {
    const mesh: MeshModel = this.model.mesh;
    const elements = mesh.elements;
    const matrix = [];
    let km: number[][];
    for (let i = 0; i < dof; i++) matrix[i] = [];
    for (let i = 0; i < elements.length; i++) {
      const elem = elements[i];
      const material = this.model.materials[elem.material];
      const mat = material.matrix;
      //
      // 要素剛性マトリクスの作成
      // mesh.getNodes(elem):要素毎の節点番号と節点のx,y,z座標を紐づける
      // mat.m3d:Dマトリクス
      km = elem.stiffnessMatrix(mesh.getNodes(elem), mat.m3d);
      this.setElementMatrix(elem, 3, matrix, km);
    }
    // // 座標変換
    // const rests = this.model.bc.restraints;
    // const index = this.model.bc.nodeIndex;
    // const bcdof = this.model.bc.dof;
    // for (let i = 0; i < rests.length; i++) {
    //   const ri = rests[i];
    //   if (ri.coords) {
    //     ri.coords.transMatrix(matrix, dof, index[ri.node], bcdof[i]);
    //   }
    // }
    /*/ 絶対値が小さい成分を除去する
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
    }*/
    return matrix;
  }

  // 全体剛性マトリクスと成分の絶対値の最大を求める
  // element - 要素
  // dof - 自由度
  // matrix - 全体剛性マトリクス
  // km - 要素の剛性マトリクス
  // kmax - 成分の絶対値の最大値
  public setElementMatrix(
    element: any,
    dof: number,
    matrix: number[][],
    km: number[][]
  ) {
    const nodeCount = element.nodeCount(); //要素1つ当たりの節点数
    const index = this.model.bc.nodeIndex; //節点の3倍の値の集合
    const nodes = element.nodes; //要素
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
              //　要素が重なるとき
              mrow[cj1] += krow[j0 + j1];
            } else {
              // 要素が重ならない時
              mrow[cj1] = krow[j0 + j1];
            }
          }
        }
      }
    }
    return matrix;
  }

  // 連立方程式を解く
  public solve() {
    // 不完全LU分解共役勾配法
    return this.solveILU(
      //　全体剛性マトリクスのデータが何も含んでいない成分を削除し、要素に寄らない一続きにしたマトリクス
      this.toSparse(this.matrix),
      //　成分一部削除後のマトリクスで不完全LU分解をする
      this.getILU(this.matrix),
      //　荷重ベクトル
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
  // matrix - 全体剛性マトリクス
  // ilu - 不完全LU分解した疎行列
  // p - ベクトル
  // iterMax - 反復回数の上限
  // thres - 収束閾値
  public solveILU(matrix, ilu, p) {
    const iterMax = p.length;
    const thres = this.ILUCG_THRES;
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
    // 入力された実荷重データを呼んでくる
    const loads = this.model.bc.loads;
    // 荷重ベクトル生成の準備（初期化）
    const vector = numeric.rep([dof], 0);
    const index = this.model.bc.nodeIndex;
    const bcdof = this.model.bc.dof;
    for (let i = 0; i < loads.length; i++) {
      // i番目の荷重関連のデータを取り出す
      const ld = loads[i];
      // i番目の荷重は節点いくつのことか
      const nd = ld.node;
      // i番目の荷重の大きさ、向き
      const ldx = loads[i].globalX;
      // i番目の荷重が作用する節点の自由度
      const ldof = bcdof[nd];
      // i番目の荷重が作用する節点の3倍の値を返す。
      const index0 = index[nd];
      // x,y,zそれぞれに対して、荷重条件のみを考慮して荷重ベクトルを作る。
      // 荷重ベクトルを作るときにはx,y,zはただ順番に入るだけで、見た目の区別はない。
      for (let j = 0; j < ldof; j++) {
        vector[index0 + j] = ldx[j];
      }
    }
    return vector;
  }

  // 行列の一部を抽出する
  // matrix1,vector1 - 元のマトリクス,ベクトル
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
  // mrow - 元のマトリクスの行データ
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
