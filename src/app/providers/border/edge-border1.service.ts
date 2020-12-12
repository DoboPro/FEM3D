import { Injectable } from '@angular/core';
import { ElementBorder } from './element-border.service';

@Injectable({
  providedIn: 'root'
})
//--------------------------------------------------------------------//
// 辺1次要素境界
// element - 要素ラベル
// nodes - 節点番号
export class EdgeBorder1 extends ElementBorder {
  constructor(element: number, nodes: number[]) {
    super(element, nodes, null);
    this.isEdge = true;
  }

  /*
  // 要素境界名称を返す
  public getName() {
    return 'EdgeBorder1';
  }

  // 節点数を返す
  public nodeCount() {
    return 2;
  }

  // 要素境界を分割する
  public splitBorder() {
    return [this.clone()];
  }

  // 形状関数行列 [ Ni dNi/dξ dNi/dη ] を返す
  // xsi,eta - 要素内部ξ,η座標
  public shapeFunction(xsi, eta) {
    if ((eta === null) || (eta === undefined)) {
      return [[0.5 * (1 - xsi), -0.5], [0.5 * (1 + xsi), 0.5, 1]];
    }
    else {
      return [[0.5 * (1 - xsi), -0.5, 0], [0.5 * (1 + xsi), 0.5, 0], [0, 0, 0]];
    }
  }

  // 形状関数マトリックス [ ∫NiNjdS ] を返す
  // p - 節点
  // coef - 係数
  public shapeFunctionMatrix(p, coef) {
    var value = C1_3 * coef * p[0].distanceTo(p[1]), vh = 0.5 * value;
    return [[value, vh], [vh, value]];
  }

  // 形状関数ベクトル [ ∫NidS ] を返す
  // p - 節点
  // coef - 係数
  public shapeFunctionVector(p, coef) {
    var value = 0.5 * coef * p[0].distanceTo(p[1]);
    return [value, value];
  }

  // 辺の法線ベクトルを返す
  // p - 節点
  // ep - 要素の節点
  public normalVector(p, ep) {
    var ne = normalVector(ep);
    var dir = p[1].clone().sub(p[0]);
    return dir.cross(ne).normalize();
  }

  */

}
