import { Injectable } from '@angular/core';
import * as THREE from 'three';

@Injectable({
  providedIn: 'root'
})
export class Comon {

  constructor() { }


  // 法線ベクトルを返す
  // p - 頂点座標
  public normalVector(p): THREE.Vector3 {
    if (p.length < 3) {
      return null;
    }
    else if ((p.length == 3) || (p.length == 6)) {
      return new THREE.Vector3().subVectors(p[1], p[0]).cross
        (new THREE.Vector3().subVectors(p[2], p[0])).normalize();
    }
    else if ((p.length == 4) || (p.length == 8)) {
      return new THREE.Vector3().subVectors(p[2], p[0]).cross
        (new THREE.Vector3().subVectors(p[3], p[1])).normalize();
    }
    else {
      let vx = 0;
      let vy = 0;
      let vz = 0;
      for (let i = 0; i < p.length; i++) {
        const p1 = p[(i + 1) % p.length]
        const p2 = p[(i + 2) % p.length];
        const norm = new THREE.Vector3().subVectors(p1, p[i]).cross
          (new THREE.Vector3().subVectors(p2, p[i]));
        vx += norm.x;
        vy += norm.y;
        vz += norm.z;
      }
      return new THREE.Vector3(vx, vy, vz).normalize();
    }
  }

  
}
