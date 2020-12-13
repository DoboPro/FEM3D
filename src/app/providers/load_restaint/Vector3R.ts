import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
//--------------------------------------------------------------------//
// ３次元ベクトル（並進＋回転）
// x,y,z - x,y,z成分
// rx,ry,rz - x,y,z軸周り回転角
export class Vector3R {

  public x: number[];

  constructor(x: number, y: number, z: number,
              rx: number, ry: number, rz: number) {
    this.x = [x || 0, y || 0, z || 0, rx || 0, ry || 0, rz || 0];
  }

  // 並進成分の大きさを返す
  public magnitude(): number {
    return Math.sqrt(this.magnitudeSq());
  }

  // 並進成分の大きさの2乗を返す
  public magnitudeSq(): number {
    return this.x[0] * this.x[0]
      + this.x[1] * this.x[1]
      + this.x[2] * this.x[2];
  }

  // 回転成分の大きさを返す
  public magnitudeR(): number {
    return Math.sqrt(this.magnitudeSqR());
  }

  // 回転成分の大きさの2乗を返す
  public magnitudeSqR(): number {
    return this.x[3] * this.x[3]
      + this.x[4] * this.x[4]
      + this.x[5] * this.x[5];
  }

  // ベクトルのコピーを返す
  public clone(): Vector3R {
    return new Vector3R(this.x[0], this.x[1], this.x[2],
      this.x[3], this.x[4], this.x[5]);
  }
}