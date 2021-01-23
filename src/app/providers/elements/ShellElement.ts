import { Injectable } from '@angular/core';
import * as THREE from '../libs/three.min.js';
import * as numeric from '../libs/numeric-1.2.6.min.js';
import { FElement } from './FElement';
import { Strain } from '../stress/Strain';
import { Stress } from '../stress/Stress';

@Injectable({
  providedIn: 'root'
})
//--------------------------------------------------------------------//
// シェル要素
// label - 要素ラベル
// material - 材料のインデックス
// param - シェルパラメータのインデックス
// nodes - 節点番号
// nodeP - 節点のξ,η座標
// intP - 積分点のξ,η座標,重み係数
export class ShellElement extends FElement {
  
  // 三角形1次要素の質量マトリックス係数
  //public TRI1_MASS1 = [[1, 0.5, 0.5],
  //[0.5, 1, 0.5],
  //[0.5, 0.5, 1]];

  public param: number;
  public nodeP: number[][];
  public intP: number[][];
  public count: number;
  public shapeFunction: any;

  constructor(label: number, material: number, param: number, nodes: number[], nodeP: number[][], intP: number[][]) {
    super(label, material, nodes);
    this.param = param;
    this.isShell = true;
    this.nodeP = nodeP;
    this.intP = intP;
  }


  // ヤコビ行列を返す
  // p - 要素節点
  // sf - 形状関数行列
  // n - 法線ベクトル
  // t - 要素厚さ
  public jacobianMatrix(p, sf, n, t) {
    const jac = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    for (let i = 0; i < this.count; i++) {
      const sfi = sf[i];
      const ppi = p[i];
      const pix = ppi.x;
      const piy = ppi.y;
      const piz = ppi.z;
      for (let j = 0; j < 2; j++) {
        const sfij = sfi[j + 1];
        jac[j] += sfij * pix;
        jac[j + 3] += sfij * piy;
        jac[j + 6] += sfij * piz;
      }
    }
    jac[2] = 0.5 * t * n.x;
    jac[5] = 0.5 * t * n.y;
    jac[8] = 0.5 * t * n.z;
    const m = new THREE.Matrix3().fromArray(jac);
    return m;
  }
  

  // 逆ヤコビ行列を返す
  // ja - ヤコビ行列
  // d - 方向余弦マトリックス
  public jacobInv(ja, d) {
    const e1 = ja.elements;
    const jd = new THREE.Matrix3().set
      (e1[0] * d[0][0] + e1[3] * d[1][0] + e1[6] * d[2][0],
        e1[0] * d[0][1] + e1[3] * d[1][1] + e1[6] * d[2][1],
        e1[0] * d[0][2] + e1[3] * d[1][2] + e1[6] * d[2][2],
        e1[1] * d[0][0] + e1[4] * d[1][0] + e1[7] * d[2][0],
        e1[1] * d[0][1] + e1[4] * d[1][1] + e1[7] * d[2][1],
        e1[1] * d[0][2] + e1[4] * d[1][2] + e1[7] * d[2][2],
        0, 0, e1[2] * d[0][2] + e1[5] * d[1][2] + e1[8] * d[2][2]);
    const m = new THREE.Matrix3().getInverse(jd, true);
    return m;
  }

  // 形状関数の勾配 [ dNi/dx dNi/dy ] を返す
  // p - 要素節点
  // ja - ヤコビ行列
  // sf - 形状関数行列
  // d - 方向余弦マトリックス
  // t - 要素厚さ
  public grad(p, ja, sf, d, t) {
    const gr = [];
    const ji = this.jacobInv(ja, d).elements;
    for (let i = 0; i < this.count; i++) {
      const sfi = sf[i], dndxsi = sfi[1], dndeta = sfi[2];
      gr[i] = [ji[0] * dndxsi + ji[3] * dndeta, ji[1] * dndxsi + ji[4] * dndeta,
      ji[2] * dndxsi + ji[5] * dndeta];
    }
    return gr;
  }

  // 歪 - 変位マトリックスの転置行列を返す
  // ja - ヤコビ行列
  // sf - 形状関数行列
  // d - 方向余弦マトリックス
  public strainMatrix1(ja, sf, d) {
    const m = numeric.rep([this.count, 4], 0);
    const ji = this.jacobInv(ja, d).elements;
    for (let i = 0; i < this.count; i++) {
      const mi = m[i], sfi = sf[i];
      for (let j = 0; j < 3; j++) {
        mi[j] = ji[j] * sfi[1] + ji[j + 3] * sfi[2];
      }
      mi[3] = ji[8] * sfi[0];
    }
    return m;
  }


  // 要素節点の角度を返す
  // p - 要素節点
  public angle(p) {
    const th = [];
    for (let i = 0; i < this.count; i++) {
      th[i] = this.planeAngle(p[i], p[(i + 1) % this.count], p[(i + this.count - 1) % this.count]);
    }
    return th;
  }


  // 節点歪・応力を返す
  // p - 要素節点
  // u - 節点変位
  // d1 - 応力 - 歪マトリックス
  // sp - シェルパラメータ
  public strainStress(p, u, d1, sp) {
    const d = this.dirMatrix(p);
    const n = this.normalVector(p);
    const v = this.toArray(u, 6, this.count);
    const t = sp.thickness;
    const strain1 = [], stress1 = [], energy1 = [], strain2 = [], stress2 = [], energy2 = [];
    for (let i = 0; i < this.count; i++) {
      const np = this.nodeP[i];
      const eps1 = this.strainPart(p, v, n, d, np[0], np[1], 1, t);
      const eps2 = this.strainPart(p, v, n, d, np[0], np[1], -1, t);
      strain1[i] = this.toStrain(eps1);
      stress1[i] = this.toStress(numeric.dotMV(d1, eps1));
      strain2[i] = this.toStrain(eps2);
      stress2[i] = this.toStress(numeric.dotMV(d1, eps2));
      strain1[i].rotate(d);
      stress1[i].rotate(d);
      strain2[i].rotate(d);
      stress2[i].rotate(d);
      energy1[i] = 0.5 * strain1[i].innerProduct(stress1[i]);
      energy2[i] = 0.5 * strain2[i].innerProduct(stress2[i]);
    }
    return [strain1, stress1, energy1, strain2, stress2, energy2];
  }


  // 要素内の歪ベクトルを返す
  // p - 要素節点
  // v - 節点変位ベクトル
  // n - 法線ベクトル
  // d - 方向余弦マトリックス
  // xsi,eta,zeta - ξ,η,ζ座標
  // t - 要素厚さ
  public strainPart(p, v, n, d, xsi, eta, zeta, t) {
    const sf = this.shapeFunction(xsi, eta);
    const ja = this.jacobianMatrix(p, sf, n, t);
    const sm = this.strainMatrix(ja, sf, d, zeta, t);
    return numeric.dotVM(v, sm);
  }


  // 形状関数マトリックス [ ∫NiNjdV ] を返す
  // p - 要素節点
  // coef - 係数
  // sp - シェルパラメータ
  public shapeFunctionMatrix(p, coef, sp) {
    const s = numeric.rep([this.count, this.count], 0);
    const t = sp.thickness;
    for (let i = 0; i < this.intP.length; i++) {
      this.addMatrix(s, this.shapePart(p, this.intP[i], coef * this.intP[i][2], t));
    }
    return s;
  }

  // 積分点の形状関数マトリックス [ NiNj ] を返す
  // p - 要素節点
  // x - ξ,η,ζ座標
  // w - 重み係数
  // t - 要素厚さ
  public shapePart(p, x, w, t) {
    const sf = this.shapeFunction(x[0], x[1]);
    const ja = this.jacobianMatrix(p, sf, this.normalVector(p), t);
    const matrix = [];
    const coef = 2 * w * Math.abs(ja.determinant());
    for (let i = 0; i < this.count; i++) {
      const matr = [], cf2 = coef * sf[i][0];
      for (let j = 0; j < this.count; j++) {
        matr[j] = cf2 * sf[j][0];
      }
      matrix[i] = matr;
    }
    return matrix;
  }


  // 積分点の拡散マトリックス [ ∇Ni・∇Nj ] を返す
  // p - 要素節点
  // x - ξ,η,ζ座標
  // w - 重み係数
  // t - 要素厚さ
  public gradPart(p, x, w, t) {
    const sf = this.shapeFunction(x[0], x[1]);
    const ja = this.jacobianMatrix(p, sf, this.normalVector(p), t);
    const gr = this.grad(p, ja, sf, this.dirMatrix(p), t);
    const matrix = [];
    const coef = 2 * w * Math.abs(ja.determinant());
    for (let i = 0; i < this.count; i++) {
      const matr = [], gri = gr[i];
      const c1 = coef * gri[0], c2 = coef * gri[1], c3 = coef * gri[2];
      for (let j = 0; j < this.count; j++) {
        const grj = gr[j];
        matr[j] = c1 * grj[0] + c2 * grj[1] + c3 * grj[2];
      }
      matrix[i] = matr;
    }
    return matrix;
  }

  // 歪 - 変位マトリックスの転置行列を返す
  // ただし歪は要素面座標、変位は全体座標
  // ja - ヤコビ行列
  // sf - 形状関数行列
  // d - 方向余弦マトリックス
  // zeta - 節点のζ座標
  // t - 要素厚さ
  public strainMatrix(ja, sf, d, zeta, t) {
    const b = this.strainMatrix1(ja, sf, d);
    const z = 0.5 * t * zeta;
    const m1 = numeric.rep([5, 6], 0);
    const matrix = numeric.rep([6 * this.count, 5], 0);
    for (let i = 0; i < this.count; i++) {
      const bi = b[i];
      m1[0][0] = bi[0];
      m1[0][4] = z * bi[0];
      m1[1][1] = bi[1];
      m1[1][3] = -z * bi[1];
      m1[2][0] = bi[1];
      m1[2][1] = bi[0];
      m1[2][3] = -z * bi[0];
      m1[2][4] = z * bi[1];
      m1[3][1] = bi[2];
      m1[3][2] = bi[1];
      m1[3][3] = -0.5 * t * bi[3] - z * bi[2];
      m1[4][0] = bi[2];
      m1[4][2] = bi[0];
      m1[4][4] = 0.5 * t * bi[3] + z * bi[2];
      const ib = 6 * i;
      for (let i1 = 0; i1 < 5; i1++) {
        const m1i = m1[i1];
        for (let j1 = 0; j1 < 3; j1++) {
          const dj = d[j1];
          let s1 = 0;
          let s2 = 0;
          for (let k1 = 0; k1 < 3; k1++) {
            s1 += m1i[k1] * dj[k1];
            s2 += m1i[k1 + 3] * dj[k1];
          }
          matrix[ib + j1][i1] += s1;
          matrix[ib + 3 + j1][i1] += s2;
        }
      }
    }
    return matrix;
  }


  // ベクトルを歪に変換する
  // s - 歪ベクトル
  public toStrain(s) {
    return new Strain([s[0], s[1], 0, s[2], s[3], s[4]]);
  }
  

  // ベクトルを歪に変換する
  // s - 歪ベクトル
  public toStress(s) {
    return new Stress([s[0], s[1], 0, s[2], s[3], s[4]]);
  }

  
  /*

  // 要素境界数を返す
  public borderCount() {
    return 2;
  }

  // 拡散マトリックス [ ∫∇Ni・∇NjdV ] を返す
  // p - 要素節点
  // coef - 係数
  // sp - シェルパラメータ
  public gradMatrix(p, coef, sp) {
    const count = this.nodeCount(), g = numeric.rep([count, count], 0);
    const t = sp.thickness;
    for (let i = 0; i < this.intP.length; i++) {
      addMatrix(g, this.gradPart(p, this.intP[i], coef * this.intP[i][2], t));
    }
    return g;
  }

  // 幾何剛性マトリックスを返す
  // p - 要素節点
  // u - 節点変位
  // d1 - 応力 - 歪マトリックス
  // sp - シェルパラメータ
  public geomStiffnessMatrix(p, u, d1, sp) {
    const count = this.nodeCount(), kk = numeric.rep([6 * count, 6 * count], 0);
    const d = dirMatrix(p), n = normalVector(p);
    const v = this.toArray(u, 6), t = sp.thickness;
    for (let i = 0; i < this.intP.length; i++) {
      const ip = this.intP[i];
      const sf = this.shapeFunction(ip[0], ip[1]);
      const ja = this.jacobianMatrix(p, sf, n, t, count);
      const gr = this.grad(p, ja, sf, d, t);
      const sm = this.strainMatrix(ja, sf, d, 0, t);
      const str = this.toStress(numeric.dotMV(d1, numeric.dotVM(v, sm)));
      const w = 2 * ip[2] * Math.abs(ja.determinant());
      for (const i1 = 0; i1 < count; i1++) {
        const i6 = 6 * i1, gri = gr[i1];
        for (let j 1 = 0; j1 < count; j1++) {
          const j6 = 6 * j1, grj = gr[j1];
          const s = w * (gri[0] * (str.xx * grj[0] + str.xy * grj[1] + str.zx * grj[2]) +
            gri[1] * (str.xy * grj[0] + str.yy * grj[1] + str.yz * grj[2]) +
            gri[2] * (str.zx * grj[0] + str.yz * grj[1] + str.zz * grj[2]));
          kk[i6][j6] += s;
          kk[i6 + 1][j6 + 1] += s;
          kk[i6 + 2][j6 + 2] += s;
        }
      }
    }
    this.toDir3(d, kk);
    return kk;
  }



  // 要素歪・応力を返す
  // p - 要素節点
  // u - 節点変位
  // d1 - 応力 - 歪マトリックス
  // sp - シェルパラメータ
  public elementStrainStress(p, u, d1, sp) {
    const d = dirMatrix(p), n = normalVector(p), v = this.toArray(u, 6);
    const t = sp.thickness, cf = 1 / this.intP.length;
    const strain1 = [0, 0, 0, 0, 0, 0], stress1 = [0, 0, 0, 0, 0, 0], energy1 = 0;
    const strain2 = [0, 0, 0, 0, 0, 0], stress2 = [0, 0, 0, 0, 0, 0], energy2 = 0;
    for (let i = 0; i < this.intP.length; i++) {
      const ip = this.intP[i];
      const eps1 = this.strainPart(p, v, n, d, ip[0], ip[1], 1, t);
      const eps2 = this.strainPart(p, v, n, d, ip[0], ip[1], -1, t);
      strain1 = numeric.add(strain1, eps1);
      strain2 = numeric.add(strain2, eps2);
      const str1 = numeric.dotMV(d1, eps1);
      const str2 = numeric.dotMV(d1, eps2);
      stress1 = numeric.add(stress1, str1);
      stress2 = numeric.add(stress2, str2);
      energy1 += numeric.dotVV(eps1, str1);
      energy2 += numeric.dotVV(eps2, str2);
    }
    strain1 = numeric.mul(strain1, cf);
    stress1 = numeric.mul(stress1, cf);
    energy1 *= 0.5 * cf;
    strain2 = numeric.mul(strain1, cf);
    stress2 = numeric.mul(stress1, cf);
    energy2 *= 0.5 * cf;
    return [this.toStrain(strain1), this.toStress(stress1), energy1,
    this.toStrain(strain2), this.toStress(stress2), energy2];
  }


  // 要素を表す文字列を返す
  // materials - 材料
  // params - シェルパラメータ
  // p - 節点
  public toString(materials, params, p) {
    const s = this.getName() + '\t' + this.label.toString(10) + '\t' +
      materials[this.material].label.toString(10) + '\t' +
      params[this.param].label.toString(10);
    for (let i = 0; i < this.nodes.length; i++) {
      s += '\t' + p[this.nodes[i]].label.toString(10);
    }
    return s;
  }

  */

}
