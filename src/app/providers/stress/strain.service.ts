import { Injectable } from '@angular/core';
import { SymmetricTensor3 } from './symmetric-tensor3.service';

@Injectable({
  providedIn: 'root'
})

//--------------------------------------------------------------------//
// 歪
// s - 成分
export class Strain extends SymmetricTensor3 {

public xy: number;
public yz: number;
public zx: number;

  constructor(s) {
    super(s);
    this.xy = 0.5 * s[3];
    this.yz = 0.5 * s[4];
    this.zx = 0.5 * s[5];
  }

  // テンソルをベクトルとして返す
  public vector() {
    return [this.xx, this.yy, this.zz, 2 * this.xy, 2 * this.yz, 2 * this.zx];
  }

}
