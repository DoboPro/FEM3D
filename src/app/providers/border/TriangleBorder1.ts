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
}
