import { Injectable } from '@angular/core';
import { Vector3R } from './Vector3R';

@Injectable({
  providedIn: 'root'
})

//--------------------------------------------------------------------//
// 荷重条件
// node - 節点ラベル
// coords - 局所座標系
// x,y,z - x,y,z成分
// rx,ry,rz - x,y,z軸周り回転角
export class Load extends Vector3R {

  public node: number;
  public coords: number;
  public globalX: number[];

  constructor(node: number, coords: number,
              x: number, y: number, z: number,
              rx = 0, ry = 0, rz = 0) {
    super(x, y, z, rx, ry, rz);
    this.node = node;
    this.coords = coords;
    this.globalX = this.x;
  }

  // 荷重条件を表す文字列を返す
  // nodes - 節点
  public toString(nodes) {
    var s = 'Load\t' + nodes[this.node].label.toString(10) + '\t' +
      this.x.join('\t');
    if (this.coords) {
      s += '\t' + this.coords.toString();//label.toString(10);
    }
    return s;
  }
}