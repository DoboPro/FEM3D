import { Injectable } from '@angular/core';
import * as THREE from 'three';

@Injectable({
  providedIn: 'root'
})

//--------------------------------------------------------------------//
// 節点
// label - 節点ラベル
// x,y,z - x,y,z座標
export class FENode extends THREE.Vector3 {

  public label: number;
  x: number;
  y: number;
  z: number;
  
  constructor(label: number, x: number, y: number, z: number) {
    super(x, y, z);
    this.label = label;
  }

  // 節点のコピーを返す
  // public clone(): FENode {
  //   return Object.create(this);
  //   // return new FENode(this.label, this.x, this.y, this.z);
  // }

  
  // 節点を表す文字列を返す
  public toString(): string {
    return 'Node\t' + this.label.toString(10) + '\t' +
      this.x + '\t' + this.y + '\t' + this.z;
  }


}