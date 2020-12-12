import { Injectable } from '@angular/core';
import { SymmetricTensor3 } from './symmetric-tensor3.service';

@Injectable({
  providedIn: 'root'
})
//--------------------------------------------------------------------//
// 応力
// s - 成分
export class Stress extends SymmetricTensor3 {

  constructor(s) {
    super(s);
  }

  // ミーゼス応力を返す
  public mises() {
    const dxy = this.xx - this.yy;
    const dyz = this.yy - this.zz;
    const dzx = this.zz - this.xx;
    const ss = dxy * dxy + dyz * dyz + dzx * dzx;
    const tt = this.xy * this.xy + this.yz * this.yz + this.zx * this.zx;
    return Math.sqrt(0.5 * ss + 3 * tt);
  }
  
}