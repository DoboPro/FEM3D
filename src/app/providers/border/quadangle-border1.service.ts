import { Injectable } from '@angular/core';
import { ElementBorder } from './element-border.service';
import { TriangleBorder1 } from './triangle-border1.service';

@Injectable({
  providedIn: 'root'
})

//--------------------------------------------------------------------//
// 四角形1次要素境界
// element - 要素ラベル
// nodes - 節点番号
export class QuadangleBorder1 extends ElementBorder {

  constructor(element, nodes, QUAD1_INT) {
    super(element, nodes, QUAD1_INT);
  }

  // 要素境界名称を返す
  public getName() {
    return 'QuadangleBorder1';
  }

  // 節点数を返す
  public nodeCount() {
    return 4;
  }

  // 要素境界を分割する
  public splitBorder() {
    var p = this.nodes;
    return [new TriangleBorder1(this.element, [p[0], p[1], p[2]]),
    new TriangleBorder1(this.element, [p[2], p[3], p[0]])];
  }

  // 形状関数行列 [ Ni dNi/dξ dNi/dη ] を返す
  // xsi,eta - 要素内部ξ,η座標
  public shapeFunction(xsi, eta) {
    return [[0.25 * (1 - xsi) * (1 - eta), -0.25 * (1 - eta), -0.25 * (1 - xsi)],
    [0.25 * (1 + xsi) * (1 - eta), 0.25 * (1 - eta), -0.25 * (1 + xsi)],
    [0.25 * (1 + xsi) * (1 + eta), 0.25 * (1 + eta), 0.25 * (1 + xsi)],
    [0.25 * (1 - xsi) * (1 + eta), -0.25 * (1 + eta), 0.25 * (1 - xsi)]];
  }
}
