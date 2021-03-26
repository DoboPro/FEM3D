import { Injectable } from '@angular/core';
import { ElementBorder } from './ElementBorder';

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

}
