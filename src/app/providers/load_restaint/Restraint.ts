import { Injectable } from '@angular/core';
import { Vector3R } from './Vector3R';
import { Coordinates } from'./Coordinates';
import * as THREE from 'three';

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

  
  //拘束条件表示オブジェクト
//rest - 拘束条件
//size - 表示サイズ
RestraintHelper(rest,size){
  THREE.Group.call(this);
  var geom;
  // 拘束条件表示マテリアル
  const REST_MAT=new THREE.MeshBasicMaterial({color:0x0066ff});
  if(rest.rest[0]){
    geom=new THREE.CylinderBufferGeometry(0,0.5*size,size,5,1);
    geom.translate(0,-0.5*size,0);
    geom.rotateZ(0.5*Math.PI);
    const rest1 = new THREE.Mesh(geom,REST_MAT);
  }
  if(rest.rest[1]){
    geom=new THREE.CylinderBufferGeometry(0,0.5*size,size,5,1);
    geom.translate(0,-0.5*size,0);
    geom.rotateX(Math.PI);
    const rest2 = new THREE.Mesh(geom,REST_MAT);
  }
  if(rest.rest[2]){
    geom=new THREE.CylinderBufferGeometry(0,0.5*size,size,5,1);
    geom.translate(0,-0.5*size,0);
    geom.rotateX(-0.5*Math.PI);
    const rest3 = new THREE.Mesh(geom,REST_MAT);
  }
  if(rest.rest[3]){
    geom=new THREE.CylinderBufferGeometry(0,0.3*size,2*size,5,1);
    geom.translate(0,size,0);
    geom.rotateZ(-0.5*Math.PI);
    const rest4 = new THREE.Mesh(geom,REST_MAT);
  }
};
}
