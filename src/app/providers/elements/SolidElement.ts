import { Injectable } from '@angular/core';
import * as THREE from 'three';
import * as numeric from '../libs/numeric-1.2.6.min.js';
import { FElement } from './FElement';
import { Strain } from '../stress/Strain';
import { Stress } from '../stress/Stress';

@Injectable({
  providedIn: 'root',
})
//--------------------------------------------------------------------//
// ソリッド要素
// label - 要素ラベル
// material - 材料のインデックス
// nodes - 節点番号
// nodeP - 節点のξ,η,ζ座標
// intP - 積分点のξ,η,ζ座標,重み係数
export class SolidElement extends FElement {
  // 三角形1次要素の質量マトリクス係数
  //public TRI1_MASS1 = [[1, 0.5, 0.5],
  //[0.5, 1, 0.5],
  //[0.5, 0.5, 1]];

  public param: number;
  public nodeP: number[][];
  public intP: number[][];
  public count: number;
  public shapeFunction: any;

  constructor(
    label: number,
    material: number,
    nodes: number[],
    nodeP: number[][],
    intP: number[][]
  ) {
    super(label, material, nodes);
    this.nodeP = nodeP;
    this.intP = intP;
    this.isShell = false;
  }

  // ☆ヤコビ行列を返す
  // p - 要素節点
  // sf - 形状関数行列
  public jacobianMatrix(p, sf) {
    const jac = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    for (var i = 0; i < this.count; i++) {
      // 形状関数のN1~N8まで順に取り出す
      const sfi = sf[i];
      // 要素節点の座標を定義する
      const pix = p[i].x;
      const piy = p[i].y;
      const piz = p[i].z;
      for (var j = 0; j < 3; j++) {
        // Nを各ξ,η,ζで微分したもの
        var sfij = sfi[j + 1];
        // ヤコビ行列の解の導出
        jac[j] += sfij * pix;
        jac[j + 3] += sfij * piy;
        jac[j + 6] += sfij * piz;
      }
    }
    return new THREE.Matrix3().fromArray(jac);
  }

  // 形状関数の勾配 [ dNi/dx dNi/dy dNi/dz ] を返す
  // p - 要素節点
  // ja - ヤコビ行列
  // sf - 形状関数行列
  public grad(p, ja, sf) {
    // 形状関数の全体座標系による微分の定義
    const gr = [];
    // ヤコビ行列の逆行列を求める
    const ji = new THREE.Matrix3().getInverse(ja, true).elements;
    //　ヤコビ行列の逆行列と形状関数の局所座標系による微分(形状関数行列)の積
    for (let i = 0; i < this.count; i++) {
      gr[i] = [
        ji[0] * sf[i][1] + ji[3] * sf[i][2] + ji[6] * sf[i][3],
        ji[1] * sf[i][1] + ji[4] * sf[i][2] + ji[7] * sf[i][3],
        ji[2] * sf[i][1] + ji[5] * sf[i][2] + ji[8] * sf[i][3],
      ];
    }
    return gr;
  }

  // Bマトリクスを転置行列にしている
  // grad - 形状関数の勾配
  public strainMatrix(grad) {
    const m = numeric.rep([3 * this.count, 6], 0);
    for (var i = 0; i < this.count; i++) {
      var i3 = 3 * i,
        gr = grad[i];
      m[i3][0] = gr[0];
      m[i3 + 1][1] = gr[1];
      m[i3 + 2][2] = gr[2];
      m[i3][3] = gr[1];
      m[i3 + 1][3] = gr[0];
      m[i3 + 1][4] = gr[2];
      m[i3 + 2][4] = gr[1];
      m[i3][5] = gr[2];
      m[i3 + 2][5] = gr[0];
    }
    return m;
  }

  // 積分点の形状関数マトリクス [ NiNj ] を返す
  // p - 要素節点
  // x - ξ,η,ζ座標
  // w - 重み係数
  public shapePart(p, x, w) {
    const sf = this.shapeFunction(x[0], x[1], x[2]);
    const ja = this.jacobianMatrix(p, sf);
    const matrix = [];
    const coef = w * Math.abs(ja.determinant());
    for (let i = 0; i < this.count; i++) {
      var matr = [],
        cf2 = coef * sf[i][0];
      for (let j = 0; j < this.count; j++) {
        matr[j] = cf2 * sf[j][0];
      }
      matrix[i] = matr;
    }
    return matrix;
  }

  // 積分点の拡散マトリクス [ ∇Ni・∇Nj ] を返す
  // p - 要素節点
  // x - ξ,η,ζ座標
  // w - 重み係数
  public gradPart(p, x, w) {
    const sf = this.shapeFunction(x[0], x[1], x[2]);
    const ja = this.jacobianMatrix(p, sf);
    const gr = this.grad(p, ja, sf);
    const matrix = [];
    const coef = w * Math.abs(ja.determinant());
    for (let i = 0; i < this.count; i++) {
      var matr = [],
        gri = gr[i];
      var c1 = coef * gri[0],
        c2 = coef * gri[1],
        c3 = coef * gri[2];
      for (let j = 0; j < this.count; j++) {
        var grj = gr[j];
        matr[j] = c1 * grj[0] + c2 * grj[1] + c3 * grj[2];
      }
      matrix[i] = matr;
    }
    return matrix;
  }

  // 質量マトリクスを返す
  // p - 要素節点
  // dens - 材料の密度
  public massMatrix(p, dens) {
    const m = numeric.rep([3 * this.count, 3 * this.count], 0);
    for (let i = 0; i < this.intP.length; i++) {
      const sf = this.shapeFunction(
        this.intP[i][0],
        this.intP[i][1],
        this.intP[i][2]
      );
      const ja = this.jacobianMatrix(p, sf);
      const coef = this.intP[i][3] * dens * Math.abs(ja.determinant());
      for (let i1 = 0; i1 < this.count; i1++) {
        for (let j1 = 0; j1 < this.count; j1++) {
          var value = coef * sf[i1][0] * sf[j1][0],
            i3 = 3 * i1,
            j3 = 3 * j1;
          m[i3][j3] += value;
          m[i3 + 1][j3 + 1] += value;
          m[i3 + 2][j3 + 2] += value;
        }
      }
    }
    return m;
  }

  // 要素剛性マトリクスを返す
  // p - 要素節点
  // d1 - 応力 - 歪マトリクス
  // intP - 積分点のξ,η,ζ座標,重み係数
  public stiffnessMatrix(p, d1) {
    //　要素剛性マトリクスの行数と列数を数える
    const count = 3 * this.count;
    //　要素剛性マトリクスの定義（numeric.jsを使う）
    const kk = numeric.rep([count, count], 0);
    for (let i = 0; i < this.intP.length; i++) {
      // この後行うガウス積分に必要となる未知数を決める処理
      // ipの中身は三次元の局所座標系で用いる変数(0:ξ,1:η,2:ζ,3:重み係数)
      const ip = this.intP[i];
      // ☆形状関数の導出（局所座標系に直したものを代入）
      // sfで形状関数の式（3次元なので8つ）求まる
      // sf[N,ξ,η,ζ]形式で格納されている
      const sf = this.shapeFunction(ip[0], ip[1], ip[2]);
      // ヤコビ行列の導出（座標変換に対応させるため）
      // p:要素ごとの接点
      const ja = this.jacobianMatrix(p, sf);

      // ☆Bマトリクス(ひずみと変位を示すマトリクス)
      // →要素剛性マトリクス
      const ks = this.stiffPart(
        d1,
        // 形状関数の全体座標上における微分処理したものを使ってBマトリクスを作る
        this.strainMatrix(this.grad(p, ja, sf)),
        ip[3] * Math.abs(ja.determinant())
      );
      this.addMatrix(kk, ks);
    }
    return kk;
  }

  // 形状関数マトリクス [ ∫NiNjdV ] を返す
  // p - 要素節点
  // coef - 係数
  public shapeFunctionMatrix(p, coef) {
    const s = numeric.rep([this.count, this.count], 0);
    for (let i = 0; i < this.intP.length; i++) {
      this.addMatrix(
        s,
        this.shapePart(p, this.intP[i], coef * this.intP[i][3])
      );
    }
    return s;
  }

  // 拡散マトリクス [ ∫∇Ni・∇NjdV ] を返す
  // p - 要素節点
  // coef - 係数
  public gradMatrix(p, coef) {
    const g = numeric.rep([this.count, this.count], 0);
    for (let i = 0; i < this.intP.length; i++) {
      this.addMatrix(g, this.gradPart(p, this.intP[i], coef * this.intP[i][3]));
    }
    return g;
  }

  // 幾何剛性マトリクスを返す
  // p - 要素節点
  // u - 節点変位
  // d1 - 応力 - 歪マトリクス
  public geomStiffnessMatrix(p, u, d1) {
    const kk = numeric.rep([3 * this.count, 3 * this.count], 0);
    var v = this.toArray(u, 3, this.count);
    for (var i = 0; i < this.intP.length; i++) {
      var ip = this.intP[i];
      var sf = this.shapeFunction(ip[0], ip[1], ip[2]);
      var ja = this.jacobianMatrix(p, sf);
      var gr = this.grad(p, ja, sf);
      var sm = this.strainMatrix(gr);
      var str = numeric.dotMV(d1, numeric.dotVM(v, sm));
      var w = ip[3] * Math.abs(ja.determinant());
      for (var i1 = 0; i1 < this.count; i1++) {
        var i3 = 3 * i1,
          gri = gr[i1];
        for (var j1 = 0; j1 < this.count; j1++) {
          var j3 = 3 * j1,
            grj = gr[j1];
          var s =
            w *
            (gri[0] * (str[0] * grj[0] + str[3] * grj[1] + str[5] * grj[2]) +
              gri[1] * (str[3] * grj[0] + str[1] * grj[1] + str[4] * grj[2]) +
              gri[2] * (str[5] * grj[0] + str[4] * grj[1] + str[2] * grj[2]));
          kk[i3][j3] += s;
          kk[i3 + 1][j3 + 1] += s;
          kk[i3 + 2][j3 + 2] += s;
        }
      }
    }
    return kk;
  }

  // 節点歪・応力を返す
  // p - 要素節点
  // u - 節点変位
  // d1 - 応力 - 歪マトリクス
  public strainStress(p, u, d1) {
    const v = this.toArray(u, 3, this.count);
    var strain = [],
      stress = [],
      energy = [];
    for (var i = 0; i < this.count; i++) {
      var eps = this.strainPart(p, v, this.nodeP[i]);
      strain[i] = new Strain(eps);
      var str = numeric.dotMV(d1, eps);
      stress[i] = new Stress(str);
      energy[i] = 0.5 * strain[i].innerProduct(stress[i]);
    }
    return [strain, stress, energy];
  }

  // 要素内の歪ベクトルを返す
  // p - 要素節点
  // v - 節点変位ベクトル
  // x - ξ,η,ζ座標
  public strainPart(p, v, x) {
    var sf = this.shapeFunction(x[0], x[1], x[2]);
    var ja = this.jacobianMatrix(p, sf);
    var sm = this.strainMatrix(this.grad(p, ja, sf));
    return numeric.dotVM(v, sm);
  }

  // 節点数を返す
  public nodeCount() {
    return 8;
  }

  /*
  // 要素歪・応力を返す
  // p - 要素節点
  // u - 節点変位
  // d1 - 応力 - 歪マトリクス
  public elementStrainStress(p, u, d1) {
    var v = this.toArray(u, 3), cf = 1 / this.intP.length;
    var strain = [0, 0, 0, 0, 0, 0], stress = [0, 0, 0, 0, 0, 0], energy = 0;
    for (var i = 0; i < this.intP.length; i++) {
      var eps = this.strainPart(p, v, this.intP[i]);
      strain = numeric.add(strain, eps);
      var str = numeric.dotMV(d1, eps);
      stress = numeric.add(stress, str);
      energy += numeric.dotVV(eps, str);
    }
    strain = numeric.mul(strain, cf);
    stress = numeric.mul(stress, cf);
    energy *= 0.5 * cf;
    return [new Strain(strain), new Stress(stress), energy];
  };


  // 要素を表す文字列を返す
  // materials - 材料
  // p - 節点
  public toString(materials, p) {
    var s = this.getName() + '\t' + this.label.toString(10) + '\t' +
      materials[this.material].label.toString(10);
    for (var i = 0; i < this.nodes.length; i++) {
      s += '\t' + p[this.nodes[i]].label.toString(10);
    }
    return s;
  };
  */
}
