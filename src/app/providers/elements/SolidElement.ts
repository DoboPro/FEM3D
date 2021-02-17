import { Injectable } from '@angular/core';
import * as THREE from 'three';
import * as numeric from '../libs/numeric-1.2.6.min.js';
import { FElement } from './FElement';
import { Strain } from '../stress/Strain';
import { Stress } from '../stress/Stress';

@Injectable({
  providedIn: 'root'
})
//--------------------------------------------------------------------//
// ソリッド要素
// label - 要素ラベル
// material - 材料のインデックス
// nodes - 節点番号
// nodeP - 節点のξ,η,ζ座標
// intP - 積分点のξ,η,ζ座標,重み係数
export class SolidElement extends FElement {
  
  // 三角形1次要素の質量マトリックス係数
  //public TRI1_MASS1 = [[1, 0.5, 0.5],
  //[0.5, 1, 0.5],
  //[0.5, 0.5, 1]];

  public param: number;
  public nodeP: number[][];
  public intP: number[][];
  public count: number;
  public shapeFunction: any;

  constructor(label: number, material: number, nodes: number[], nodeP: number[][], intP: number[][]) {
    super(label, material, nodes);
    this.nodeP = nodeP;
    this.intP = intP;
    this.isShell = false;
    this.nodeP = nodeP;
    this.intP = intP;
  }


  // ヤコビ行列を返す
 // p - 要素節点
 // sf - 形状関数行列
  public jacobianMatrix(p, sf) {
    const jac = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    for (var i = 0; i < this.count; i++) {
      const sfi = sf[i];
      const pix = p[i].x;
      const piy = p[i].y;
      const piz = p[i].z;
      for (var j = 0; j < 3; j++) {
        var sfij = sfi[j + 1];
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
    const gr = [];
    const ji = new THREE.Matrix3().getInverse(ja, true).elements;
    for (let i = 0; i < this.count; i++) {
      gr[i] = [ji[0] * sf[i][1] + ji[3] * sf[i][2] + ji[6] * sf[i][3],
      ji[1] * sf[i][1] + ji[4] * sf[i][2] + ji[7] * sf[i][3],
      ji[2] * sf[i][1] + ji[5] * sf[i][2] + ji[8] * sf[i][3]];
    }
    return gr;
  };

  // 歪 - 変位マトリックスの転置行列を返す
  // grad - 形状関数の勾配
  public strainMatrix(grad) {
    const m = numeric.rep([3 * this.count, 6], 0);
    for (var i = 0; i < this.count; i++) {
      var i3 = 3 * i, gr = grad[i];
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
  };


  // 積分点の形状関数マトリックス [ NiNj ] を返す
  // p - 要素節点
  // x - ξ,η,ζ座標
  // w - 重み係数
  public shapePart(p, x, w) {
    const sf = this.shapeFunction(x[0], x[1], x[2]);
    const ja = this.jacobianMatrix(p, sf);
    const matrix = [];
    const coef = w * Math.abs(ja.determinant());
    for (let i = 0; i < this.count; i++) {
      var matr = [], cf2 = coef * sf[i][0];
      for (let j = 0; j < this.count; j++) {
        matr[j] = cf2 * sf[j][0];
      }
      matrix[i] = matr;
    }
    return matrix;
  };


  // 積分点の拡散マトリックス [ ∇Ni・∇Nj ] を返す
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
      var matr = [], gri = gr[i];
      var c1 = coef * gri[0], c2 = coef * gri[1], c3 = coef * gri[2];
      for (let j = 0; j < this.count; j++) {
        var grj = gr[j];
        matr[j] = c1 * grj[0] + c2 * grj[1] + c3 * grj[2];
      }
      matrix[i] = matr;
    }
    return matrix;
  };

  // 質量マトリックスを返す
  // p - 要素節点
  // dens - 材料の密度
  public massMatrix(p, dens) {
    const m = numeric.rep([3 * this.count, 3 * this.count], 0);
    for (let i = 0; i < this.intP.length; i++) {
      const sf = this.shapeFunction(this.intP[i][0], this.intP[i][1],
        this.intP[i][2]);
      const ja = this.jacobianMatrix(p, sf);
      const coef = this.intP[i][3] * dens * Math.abs(ja.determinant());
      for (let i1 = 0; i1 < this.count; i1++) {
        for (let j1 = 0; j1 < this.count; j1++) {
          var value = coef * sf[i1][0] * sf[j1][0], i3 = 3 * i1, j3 = 3 * j1;
          m[i3][j3] += value;
          m[i3 + 1][j3 + 1] += value;
          m[i3 + 2][j3 + 2] += value;
        }
      }
    }
    return m;
  };

  // 剛性マトリックスを返す
  // p - 要素節点
  // d1 - 応力 - 歪マトリックス
  public stiffnessMatrix(p, d1) {
    const count = 3 * this.count;
    const kk = numeric.rep([count, count], 0);
    for (let i = 0; i < this.intP.length; i++) {
      const ip = this.intP[i];
      const sf = this.shapeFunction(ip[0], ip[1], ip[2]);
      const ja = this.jacobianMatrix(p, sf);
      const ks = this.stiffPart(
        d1,
        this.strainMatrix(this.grad(p, ja, sf)),
        ip[3] * Math.abs(ja.determinant()));
      this.addMatrix(kk, ks);
    }
    return kk;
  };


  // 形状関数マトリックス [ ∫NiNjdV ] を返す
  // p - 要素節点
  // coef - 係数
  public shapeFunctionMatrix(p, coef) {
    const s = numeric.rep([this.count, this.count], 0);
    for (let i = 0; i < this.intP.length; i++) {
      this.addMatrix(s, this.shapePart(p, this.intP[i], coef * this.intP[i][3]));
    }
    return s;
  };

  // 拡散マトリックス [ ∫∇Ni・∇NjdV ] を返す
  // p - 要素節点
  // coef - 係数
  public gradMatrix(p, coef) {
    const g = numeric.rep([this.count, this.count], 0);
    for (let i = 0; i < this.intP.length; i++) {
      this.addMatrix(g, this.gradPart(p, this.intP[i], coef * this.intP[i][3]));
    }
    return g;
  };


  // 幾何剛性マトリックスを返す
  // p - 要素節点
  // u - 節点変位
  // d1 - 応力 - 歪マトリックス
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
        var i3 = 3 * i1, gri = gr[i1];
        for (var j1 = 0; j1 < this.count; j1++) {
          var j3 = 3 * j1, grj = gr[j1];
          var s = w * (gri[0] * (str[0] * grj[0] + str[3] * grj[1] + str[5] * grj[2]) +
            gri[1] * (str[3] * grj[0] + str[1] * grj[1] + str[4] * grj[2]) +
            gri[2] * (str[5] * grj[0] + str[4] * grj[1] + str[2] * grj[2]));
          kk[i3][j3] += s;
          kk[i3 + 1][j3 + 1] += s;
          kk[i3 + 2][j3 + 2] += s;
        }
      }
    }
    return kk;
  };

  // 節点歪・応力を返す
  // p - 要素節点
  // u - 節点変位
  // d1 - 応力 - 歪マトリックス
  public strainStress(p, u, d1) {
    const v = this.toArray(u, 3, this.count);
    var strain = [], stress = [], energy = [];
    for (var i = 0; i < this.count; i++) {
      var eps = this.strainPart(p, v, this.nodeP[i]);
      strain[i] = new Strain(eps);
      var str = numeric.dotMV(d1, eps);
      stress[i] = new Stress(str);
      energy[i] = 0.5 * strain[i].innerProduct(stress[i]);
    }
    return [strain, stress, energy];
  };

  // 要素内の歪ベクトルを返す
  // p - 要素節点
  // v - 節点変位ベクトル
  // x - ξ,η,ζ座標
  public strainPart(p, v, x) {
    var sf = this.shapeFunction(x[0], x[1], x[2]);
    var ja = this.jacobianMatrix(p, sf);
    var sm = this.strainMatrix(this.grad(p, ja, sf));
    return numeric.dotVM(v, sm);
  };


  // 節点数を返す
  public nodeCount() {
    return 8;
  }

  /*
  // 要素歪・応力を返す
  // p - 要素節点
  // u - 節点変位
  // d1 - 応力 - 歪マトリックス
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
