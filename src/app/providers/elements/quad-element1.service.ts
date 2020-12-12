import { Injectable } from '@angular/core';
import { QuadangleBorder1 } from '../border/quadangle-border1.service';
import { ShellElement } from './shell-element.service';

@Injectable({
  providedIn: 'root'
})
//--------------------------------------------------------------------//
// 四角形1次要素 (MITC4)
// label - 要素ラベル
// material - 材料のインデックス
// param - シェルパラメータのインデックス
// nodes - 節点番号
export class QuadElement1 extends ShellElement {

  // 四角形1次要素の節点のξ,η座標
  public QUAD1_NODE: number[][];
  // 四角形1次要素の積分点のξ,η座標,重み係数
  public QUAD1_INT: number[][];

  constructor(label: number, material: number, param: number, nodes: number[]) {
    super(label, material, param, nodes,

      [[-1, -1],
      [1, -1],
      [1, 1],
      [-1, 1]],
      
      [[-1 / Math.sqrt(3), -1 / Math.sqrt(3), 1],
      [1 / Math.sqrt(3), -1 / Math.sqrt(3), 1],
      [-1 / Math.sqrt(3), 1 / Math.sqrt(3), 1],
      [1 / Math.sqrt(3), 1 / Math.sqrt(3), 1]]);
    
    this.QUAD1_NODE = this.nodeP;  // 四角形1次要素の節点のξ,η座標
    this.QUAD1_INT = this.intP;    // 四角形1次要素の積分点のξ,η座標,重み係数
  }


  // 要素境界を返す
  // element - 要素ラベル
  // index - 要素境界のインデックス
  public border(element, index) {
    const p = this.nodes;
    switch (index) {
      default:
        return null;
      case 0:
        return new QuadangleBorder1(element, [p[0], p[1], p[2], p[3]], this.QUAD1_INT);
      case 1:
        return new QuadangleBorder1(element, [p[0], p[3], p[2], p[1]], this.QUAD1_INT);
    }
  }

  
  // 要素名称を返す
  public getName() {
    return 'QuadElement1';
  };
 
  // 節点数を返す
  public nodeCount() {
    return 4;
  }
 
  /*
 
  // 要素境界辺を返す
  // element - 要素ラベル
  // index - 要素境界辺のインデックス
  public borderEdge(element, index) {
    const p = this.nodes;
    switch (index) {
      default:
        return null;
      case 0:
        return new EdgeBorder1(element, [p[0], p[1]]);
      case 1:
        return new EdgeBorder1(element, [p[1], p[2]]);
      case 2:
        return new EdgeBorder1(element, [p[2], p[3]]);
      case 3:
        return new EdgeBorder1(element, [p[3], p[0]]);
    }
  };
 
  // 要素を鏡像反転する
  public mirror() {
    this.swap(this.nodes, 1, 3);
  };
 
  // 形状関数行列 [ Ni dNi/dξ dNi/dη ] を返す
  // xsi,eta - 要素内部ξ,η座標
  public shapeFunction(xsi, eta) {
    return [[0.25 * (1 - xsi) * (1 - eta), -0.25 * (1 - eta), -0.25 * (1 - xsi)],
    [0.25 * (1 + xsi) * (1 - eta), 0.25 * (1 - eta), -0.25 * (1 + xsi)],
    [0.25 * (1 + xsi) * (1 + eta), 0.25 * (1 + eta), 0.25 * (1 + xsi)],
    [0.25 * (1 - xsi) * (1 + eta), -0.25 * (1 + eta), 0.25 * (1 - xsi)]];
  };
 
  // 質量マトリックスを返す
  // p - 要素節点
  // dens - 材料の密度
  // t - 要素厚さ
  public massMatrix(p, dens, t) {
    const count = this.nodeCount(), m = numeric.rep([6 * count, 6 * count], 0);
    const d = dirMatrix(p), n = normalVector(p), tt = C1_12 * t * t;
    for (let i = 0; i < this.intP.length; i++) {
      const ipi = this.intP[i], sf = this.shapeFunction(ipi[0], ipi[1]);
      const nn = [sf[0][0], sf[1][0], sf[2][0], sf[3][0]];
      const jac = Math.abs(this.jacobianMatrix(p, sf, n, t).determinant());
      jac *= 2 * ipi[2];
      for (const i1 = 0; i1 < count; i1++) {
        const i6 = 6 * i1, nja = nn[i1] * jac;
        for (let j 1 = 0; j1 < count; j1++) {
          const j6 = 6 * j1, nnja = nja * nn[j1], dm = dens * nnja, dii = tt * dm;
          m[i6][j6] += dm;
          m[i6 + 1][j6 + 1] += dm;
          m[i6 + 2][j6 + 2] += dm;
          m[i6 + 3][j6 + 3] += dii;
          m[i6 + 4][j6 + 4] += dii;
          m[i6 + 5][j6 + 5] += 1e-4 * dii;
        }
      }
    }
    toDir3(d, m);
    return m;
  }
 
  // 剛性マトリックスを返す
  // p - 要素節点
  // d1 - 応力 - 歪マトリックス
  // sp - シェルパラメータ
  public stiffnessMatrix(p, d1, sp) {
    const size = 6 * this.nodeCount(), kk = numeric.rep([size, size], 0);
    const n = normalVector(p), t = sp.thickness;
    for (let i = 0; i < this.intP.length; i++) {
      const ks = this.stiffPart(p, d1, n, this.intP[i][0], this.intP[i][1], t);
      addMatrix(kk, ks);
    }
    return kk;
  }
 
  // 積分点の剛性マトリックスを返す
  // p - 要素節点
  // d1 - 応力 - 歪マトリックス
  // n - 法線ベクトル
  // xsi,eta - 要素内部ξ,η座標
  // t - 要素厚さ
  public stiffPart(p, d1, n, xsi, eta, t) {
    const d = dirMatrix(p);
    const sf = this.shapeFunction(xsi, eta);
    const ja = this.jacobianMatrix(p, sf, n, t);
    const bc0 = this.strainMatrix1(ja, sf, d);
    const sf1 = this.shapeFunction(xsi, 0);
    const ja1 = this.jacobianMatrix(p, sf1, n, t);
    const sf2 = this.shapeFunction(0, eta);
    const ja2 = this.jacobianMatrix(p, sf2, n, t);
    const bc = [this.strainMatrix1(ja1, sf1, d), this.strainMatrix1(ja2, sf2, d)];
    const count = this.nodeCount();
    const kk = numeric.rep([6 * count, 6 * count], 0);
    const jacob = Math.abs(ja.determinant());
 
    const tt6 = t * t / 6.0, ce1 = 1e-3 * t * t * d1[3][3]
    const ce2 = -ce1 / (count - 1);
    const k1 = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
    const k2 = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
    const k3 = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
    const k4 = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
    for (let i = 0; i < count; i++) {
      for (let j = 0; j < count; j++) {
        for (let j1 = 0; j1 < 3; j1++) {
          for (let j2 = 0; j2 < 3; j2++) {
            k1[j1][j2] = 0;
            k2[j1][j2] = 0;
            k3[j1][j2] = 0;
            k4[j1][j2] = 0;
          }
        }
        for (let j1 = 0; j1 < 2; j1++) {
          for (let j2 = 0; j2 < 2; j2++) {
            k1[j1][j2] = bc0[i][j1] * d1[j1][j2] * bc0[j][j2] +
              bc0[i][1 - j1] * d1[2][2] * bc0[j][1 - j2];
          }
          const dd = d1[4 - j1][4 - j1];
          k1[j1][j1] += bc[1 - j1][i][2] * dd * bc[1 - j1][j][2];
          k1[j1][2] = bc[1 - j1][i][2] * dd * bc[j1][j][j1];
          k1[2][j1] = bc[j1][i][j1] * dd * bc[1 - j1][j][2];
          k2[j1][j1] = bc[1 - j1][i][2] * dd * bc[1 - j1][j][3];
          k2[2][j1] = bc[1 - j1][i][j1] * dd * bc[1 - j1][j][3];
          k3[j1][j1] = bc[1 - j1][i][3] * dd * bc[1 - j1][j][2];
          k3[j1][2] = bc[1 - j1][i][3] * dd * bc[1 - j1][j][j1];
        }
        k1[2][2] = bc[0][i][1] * d1[3][3] * bc[0][j][1] +
          bc[1][i][0] * d1[4][4] * bc[1][j][0];
        k4[0][0] = k1[1][1] + 3 * bc[0][i][3] * d1[3][3] * bc[0][j][3];
        k4[0][1] = -k1[1][0];
        k4[1][0] = -k1[0][1];
        k4[1][1] = k1[0][0] + 3 * bc[1][i][3] * d1[4][4] * bc[1][j][3];
        for (let j1 = 0; j1 < 3; j1++) {
          let kt = k2[j1][0];
          k2[j1][0] = -k2[j1][1];
          k2[j1][1] = kt;
          kt = k3[0][j1];
          k3[0][j1] = -k3[1][j1];
          k3[1][j1] = kt;
        }
 
        if (i == j) k4[2][2] = ce1;
        else k4[2][2] = ce2;
        this.toDir(d, k1);
        this.toDir(d, k2);
        this.toDir(d, k3);
        this.toDir(d, k4);
        const i0 = 6 * i;
        const j0 = 6 * j;
        for (let j1 = 0; j1 < 3; j1++) {
          for (let j2 = 0; j2 < 3; j2++) {
            kk[i0 + j1][j0 + j2] = 2 * jacob * k1[j1][j2];
            kk[i0 + j1][j0 + 3 + j2] = t * jacob * k2[j1][j2];
            kk[i0 + 3 + j1][j0 + j2] = t * jacob * k3[j1][j2];
            kk[i0 + 3 + j1][j0 + 3 + j2] = tt6 * jacob * k4[j1][j2];
          }
        }
      }
    }
    return kk;
  }
 
  */

}
