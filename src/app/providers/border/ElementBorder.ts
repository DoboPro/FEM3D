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
}
