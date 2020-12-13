import { Injectable } from '@angular/core';
import { ElementBorder } from './ElementBorder';

@Injectable({
  providedIn: 'root'
})
//--------------------------------------------------------------------//
// 三角形1次要素境界
// element - 要素ラベル
// nodes - 節点番号
export class TriangleBorder1 extends ElementBorder {

  constructor(element, nodes) {
    super(element, nodes, null);
  }
  /*
  // 要素境界名称を返す
  public getName() {
    return 'TriangleBorder1';
  }

  // 節点数を返す
  public nodeCount() {
    return 3;
  }

  // 要素境界を分割する
  public splitBorder() {
    return [this.clone()];
  }

  // 形状関数行列 [ Ni dNi/dξ dNi/dη ] を返す
  // xsi,eta - 要素内部ξ,η座標
  public shapeFunction(xsi, eta) {
    return [[1 - xsi - eta, -1, -1], [xsi, 1, 0], [eta, 0, 1]];
  }

  // 擬似ヤコビアンを返す
  // p - 節点
  public jacobian(p) {
    var p0x = p[0].x, p0y = p[0].y, p0z = p[0].z;
    var j1 = (p[1].y - p0y) * (p[2].z - p0z) - (p[1].z - p0z) * (p[2].y - p0y);
    var j2 = (p[1].z - p0z) * (p[2].x - p0x) - (p[1].x - p0x) * (p[2].z - p0z);
    var j3 = (p[1].x - p0x) * (p[2].y - p0y) - (p[1].y - p0y) * (p[2].x - p0x);
    return Math.sqrt(j1 * j1 + j2 * j2 + j3 * j3);
  }

  // 形状関数マトリックス [ ∫NiNjdS ] を返す
  // p - 節点
  // coef - 係数
  public shapeFunctionMatrix(p, coef) {
    var value = coef * this.jacobian(p) / 12, vh = 0.5 * value;
    var count = this.nodeCount(), s = numeric.rep([count, count], vh);
    for (var i = 0; i < count; i++) {
      s[i][i] = value;
    }
    return s;
  }

  // 形状関数ベクトル [ ∫NidS ] を返す
  // p - 節点
  // coef - 係数
  public shapeFunctionVector(p, coef) {
    return numeric.rep([this.nodeCount()], C1_6 * coef * this.jacobian(p));
  }
  */
}
