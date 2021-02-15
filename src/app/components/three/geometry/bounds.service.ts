import { Injectable } from '@angular/core';
import * as THREE from 'three';

@Injectable({
  providedIn: 'root'
})
export class BoundsService {


  public box: THREE.Box3;
  public center: THREE.Vector3;
  public size: number;
  public viewPoint: number;
  
  constructor() { 
    this.box=new THREE.Box3();
    this.center=new THREE.Vector3();
    this.size=1;
    this.viewPoint=1;
  }
  changeData() {
    throw new Error('Method not implemented.');
  }

  // モデル境界を設定する
  public set(): void{
    
    // this.box.setFromPoints(model.mesh.nodes);
    // this.center.copy(this.box.getCenter());
    this.size=Math.max(this.box.max.x-this.box.min.x,
                      this.box.max.y-this.box.min.y,
                      this.box.max.z-this.box.min.z);
    this.viewPoint=2*this.size;
  };

  // 光源位置を設定する
  // p - 光源位置
  public setLightPosition(p){
    p.set(this.size,-this.size,this.size);
  };

}
