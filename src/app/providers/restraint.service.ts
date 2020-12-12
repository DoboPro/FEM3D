import { Injectable } from '@angular/core';
import { Vector3R } from './vector3-r.service';
import { Coordinates } from'./coordinates.service';

@Injectable({
  providedIn: 'root'
})
//--------------------------------------------------------------------//
// 拘束条件
// node - 節点ラベル
// coords - 局所座標系
// restx,resty,restz - x,y,z方向の拘束の有無
// x,y,z - 強制変位のx,y,z成分
// restrx,restry,restrz - x,y,z方向の回転拘束の有無
// rx,ry,rz - 強制変位のx,y,z軸周り回転角
export class Restraint extends Vector3R {

  public node: number;
  public coords: Coordinates;
  public rest: boolean[];
  public globalX: number[];

  constructor(node: number, coords: Coordinates,
              restx: boolean, resty: boolean, restz: boolean,
              x: number, y: number, z: number,
              restrx = true, restry = true, restrz = true,
              rx = 0, ry = 0, rz = 0) {
    super(x, y, z, rx, ry, rz);
    this.node = node;
    this.coords = coords;
    this.rest = [restx, resty, restz, restrx, restry, restrz];
    this.globalX = this.x;
  }

  // 拘束条件を表す文字列を返す
  // nodes - 節点
  public toString(nodes) {
    var s = 'Restraint\t' + nodes[this.node].label.toString(10);
    for (var i = 0; i < 6; i++) {
      if (this.rest[i]) {
        s += '\t1\t' + this.x[i];
      }
      else {
        s += '\t0\t' + this.x[i];
      }
    }
    if (this.coords) {
      s += '\t' + this.coords.toString();//.label.toString(10);
    }
    return s;
  }
}
