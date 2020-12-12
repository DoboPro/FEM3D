import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
//--------------------------------------------------------------------//
// 要素境界
// element - 要素ラベル
// nodes - 節点番号
// intP - 積分点のξ,η座標,重み係数
export class ElementBorder {

  /*
  // 四角形2次要素の積分点のξ,η座標,重み係数
var QUAD2_INT = [[GX3[0], GX3[0], GW3[0] * GW3[0]],
[GX3[1], GX3[0], GW3[1] * GW3[0]],
[GX3[2], GX3[0], GW3[2] * GW3[0]],
[GX3[0], GX3[1], GW3[0] * GW3[1]],
[GX3[1], GX3[1], GW3[1] * GW3[1]],
[GX3[2], GX3[1], GW3[2] * GW3[1]],
[GX3[0], GX3[2], GW3[0] * GW3[2]],
[GX3[1], GX3[2], GW3[1] * GW3[2]],
  [GX3[2], GX3[2], GW3[2] * GW3[2]]];
*/

  public element: number;
  public intP: number[][];
  public isEdge: boolean;		// 辺ではない
  public nodes: number[];

  constructor(element: number, nodes: number[], intP: number[][]) {
    this.nodes = nodes;
    this.element = element;
    this.intP = intP;
    this.isEdge = false;		// 辺ではない
  }

  // 周回順に並んだ節点ラベルを返す
  public cycleNodes() {
    return this.nodes;
  }

  // 要素境界を比較する
  // b - 比較対象の要素境界
  public compare(b) {
    const p1 = this.nodes.concat();
    const p2 = b.nodes.concat();
    p1.sort((a, b) => { return a - b; });
    p2.sort((a, b) => { return a - b; });
    const len = Math.min(p1.length, p2.length);
    for (let i = 0; i < len; i++) {
      const d = p1[i] - p2[i];
      if (d !== 0) return d;
    }
    return p1.length - p2.length;
  }

  /*
  // 要素境界のコピーを返す
  public clone() {
    return new ElementBorder(this.element, this.nodes.concat());
  };


  // 擬似ヤコビアンを返す
  // p - 節点
  // sf - 形状関数行列
  public jacobian(p, sf) {
    var count = this.nodeCount(), jac = [0, 0, 0, 0, 0, 0];
    for (var i = 0; i < count; i++) {
      for (var j = 0; j < 2; j++) {
        jac[j] += sf[i][j + 1] * p[i].x;
        jac[j + 2] += sf[i][j + 1] * p[i].y;
        jac[j + 4] += sf[i][j + 1] * p[i].z;
      }
    }
    var j1 = jac[2] * jac[5] - jac[4] * jac[3];
    var j2 = jac[4] * jac[1] - jac[0] * jac[5];
    var j3 = jac[0] * jac[3] - jac[2] * jac[1];
    return Math.sqrt(j1 * j1 + j2 * j2 + j3 * j3);
  };

  // 積分点の形状関数マトリックス [ NiNj ] を返す
  // p - 節点
  // x - ξ,η座標
  // w - 重み係数
  public shapeMatrixPart(p, x, w) {
    var sf = this.shapeFunction(x[0], x[1]);
    var coef = w * this.jacobian(p, sf);
    var count = this.nodeCount(), matrix = [];
    for (var i = 0; i < count; i++) {
      matrix[i] = [];
      var cf2 = coef * sf[i][0];
      for (var j = 0; j < count; j++) {
        matrix[i][j] = cf2 * sf[j][0];
      }
    }
    return matrix;
  };

  // 積分点の形状関数ベクトル [ Ni ] を返す
  // p - 節点
  // x - ξ,η座標
  // w - 重み係数
  public shapeVectorPart(p, x, w) {
    var sf = this.shapeFunction(x[0], x[1]);
    var coef = w * this.jacobian(p, sf);
    var count = this.nodeCount(), vector = [];
    for (var i = 0; i < count; i++) {
      vector[i] = coef * sf[i][0];
    }
    return vector;
  };

  // 形状関数マトリックス [ ∫NiNjdS ] を返す
  // p - 節点
  // coef - 係数
  public shapeFunctionMatrix(p, coef) {
    var count = this.nodeCount(), s = numeric.rep([count, count], 0);
    for (var i = 0; i < this.intP.length; i++) {
      addMatrix(s, this.shapeMatrixPart(p, this.intP[i],
        coef * this.intP[i][2]));
    }
    return s;
  };

  // 形状関数ベクトル [ ∫NidS ] を返す
  // p - 節点
  // coef - 係数
  public shapeFunctionVector(p, coef) {
    var count = this.nodeCount(), s = numeric.rep([count], 0);
    for (var i = 0; i < this.intP.length; i++) {
      addVector(s, this.shapeVectorPart(p, this.intP[i],
        coef * this.intP[i][2]));
    }
    return s;
  }

  */

}
