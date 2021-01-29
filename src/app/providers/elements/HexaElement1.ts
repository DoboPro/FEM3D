import { Injectable } from '@angular/core';
import { QuadangleBorder1 } from '../border/QuadangleBorder1';
import { ShellElement } from './ShellElement';
import  * as numeric from '../libs/numeric-1.2.6.min.js';
import { SolidElement } from './SolidElement';

@Injectable({
  providedIn: 'root'
})
//--------------------------------------------------------------------//
// 六面体1次要素
// label - 要素ラベル
// material - 材料のインデックス
// nodes - 節点番号
export class HexaElement1 extends SolidElement {

// 六面体1次要素の節点のξ,η,ζ座標
  public HEXA1_NODE: number[][];
// 六面体1次要素の積分点のξ,η,ζ座標,重み係数
  public HEXA1_INT: number[][];

  // 六面体1次要素の質量マトリックス係数
  public HEXA1_MASS_BASE: number[][];

  constructor(label: number, material: number, nodes: number[]) {
    super(label, material, nodes,

      [[-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
        [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]],
      
      [[-1 / Math.sqrt(3), -1 / Math.sqrt(3), -1 / Math.sqrt(3), 1], [1 / Math.sqrt(3), -1 / Math.sqrt(3), -1 / Math.sqrt(3), 1],
        [-1 / Math.sqrt(3), 1 / Math.sqrt(3), -1 / Math.sqrt(3), 1], [1 / Math.sqrt(3), 1 / Math.sqrt(3), -1 / Math.sqrt(3), 1],
        [-1 / Math.sqrt(3), -1 / Math.sqrt(3), 1 / Math.sqrt(3), 1], [1 / Math.sqrt(3), -1 / Math.sqrt(3), 1 / Math.sqrt(3), 1],
        [-1 / Math.sqrt(3), 1 / Math.sqrt(3), 1 / Math.sqrt(3), 1], [1 / Math.sqrt(3), 1 / Math.sqrt(3), 1 / Math.sqrt(3), 1]]);

    
    this.HEXA1_NODE = this.nodeP;  
    this.HEXA1_INT = this.intP;    

    this.HEXA1_MASS_BASE = [];
    for (let i = 0; i < 8; i++) {
      this.HEXA1_MASS_BASE[i] = [];
      for (let j = 0; j < 8; j++) {
        const s = Math.abs(this.HEXA1_NODE[i][0] - this.HEXA1_NODE[j][0]) +
          Math.abs(this.HEXA1_NODE[i][1] - this.HEXA1_NODE[j][1]) +
          Math.abs(this.HEXA1_NODE[i][2] - this.HEXA1_NODE[j][2]);
        this.HEXA1_MASS_BASE[i][j] = Math.pow(0.5, 0.5 * s) / 27;
      }
    }

    this.count = this.nodeCount();
    this.shapeFunction = this.shapeFunction1;

  }

  // 要素名称を返す
  public getName() {
    return 'HexaElement1';
  };

  // 節点数を返す
  public nodeCount() {
    return 8;
  };

  // 要素境界数を返す
  public borderCount() {
    return 6;
  };

  // 要素境界を返す
  // element - 要素ラベル
  // index - 要素境界のインデックス
  public border(element, index) {
    const p = this.nodes;
    switch (index) {
      default:
        return null;
      case 0:
        return new QuadangleBorder1(element, [p[0], p[3], p[2], p[1]], this.HEXA1_INT);
      case 1:
        return new QuadangleBorder1(element, [p[4], p[5], p[6], p[7]], this.HEXA1_INT);
      case 2:
        return new QuadangleBorder1(element, [p[0], p[1], p[5], p[4]], this.HEXA1_INT);
      case 3:
        return new QuadangleBorder1(element, [p[1], p[2], p[6], p[5]], this.HEXA1_INT);
      case 4:
        return new QuadangleBorder1(element, [p[2], p[3], p[7], p[6]], this.HEXA1_INT);
      case 5:
        return new QuadangleBorder1(element, [p[3], p[0], p[4], p[7]], this.HEXA1_INT);
    }
  };

  // 要素を鏡像反転する
  public mirror() {
    this.swap(this.nodes, 1, 3);
    this.swap(this.nodes, 5, 7);
  };

  // 要素節点の角度を返す
  // p - 要素節点
  public angle(p) {
    const th = [];
    for (let i = 0; i < 4; i++) {
      th[i] = this.solidAngle(p[i], p[(i + 1) % 4], p[(i + 3) % 4], p[i + 4]);
      th[i + 4] = this.solidAngle(p[i + 4], p[(i + 1) % 4 + 4], p[(i + 3) % 4 + 4], p[i]);
    }
    return th;
  };

  // 形状関数行列 [ Ni dNi/dξ dNi/dη dNi/dζ ] を返す
  // xsi,eta,zeta - 要素内部ξ,η,ζ座標
  public shapeFunction1(xsi, eta, zeta) {
    return [[0.125 * (1 - xsi) * (1 - eta) * (1 - zeta), -0.125 * (1 - eta) * (1 - zeta),
    -0.125 * (1 - xsi) * (1 - zeta), -0.125 * (1 - xsi) * (1 - eta)],
    [0.125 * (1 + xsi) * (1 - eta) * (1 - zeta), 0.125 * (1 - eta) * (1 - zeta),
    -0.125 * (1 + xsi) * (1 - zeta), -0.125 * (1 + xsi) * (1 - eta)],
    [0.125 * (1 + xsi) * (1 + eta) * (1 - zeta), 0.125 * (1 + eta) * (1 - zeta),
    0.125 * (1 + xsi) * (1 - zeta), -0.125 * (1 + xsi) * (1 + eta)],
    [0.125 * (1 - xsi) * (1 + eta) * (1 - zeta), -0.125 * (1 + eta) * (1 - zeta),
    0.125 * (1 - xsi) * (1 - zeta), -0.125 * (1 - xsi) * (1 + eta)],
    [0.125 * (1 - xsi) * (1 - eta) * (1 + zeta), -0.125 * (1 - eta) * (1 + zeta),
    -0.125 * (1 - xsi) * (1 + zeta), 0.125 * (1 - xsi) * (1 - eta)],
    [0.125 * (1 + xsi) * (1 - eta) * (1 + zeta), 0.125 * (1 - eta) * (1 + zeta),
    -0.125 * (1 + xsi) * (1 + zeta), 0.125 * (1 + xsi) * (1 - eta)],
    [0.125 * (1 + xsi) * (1 + eta) * (1 + zeta), 0.125 * (1 + eta) * (1 + zeta),
    0.125 * (1 + xsi) * (1 + zeta), 0.125 * (1 + xsi) * (1 + eta)],
    [0.125 * (1 - xsi) * (1 + eta) * (1 + zeta), -0.125 * (1 + eta) * (1 + zeta),
    0.125 * (1 - xsi) * (1 + zeta), 0.125 * (1 - xsi) * (1 + eta)]];
  };

  // 質量マトリックスを返す
  // p - 要素節点
  // dens - 材料の密度
  public massMatrix(p, dens) {
    let ja = 0;
    for (let i = 0; i < 8; i++) {
      const sf = this.shapeFunction(this.HEXA1_INT[i][0], this.HEXA1_INT[i][1],
        this.HEXA1_INT[i][2]);
      ja += Math.abs(this.jacobianMatrix(p, sf).determinant());
    }
    const coef = dens * ja, m = numeric.rep([24, 24], 0);
    for (let i = 0; i < 8; i++) {
      const i3 = 3 * i;
      for (let j = 0; j < 8; j++) {
        const value = coef * this.HEXA1_MASS_BASE[i][j], j3 = 3 * j;
        m[i3][j3] += value;
        m[i3 + 1][j3 + 1] += value;
        m[i3 + 2][j3 + 2] += value;
      }
    }
    return m;
  };

}
