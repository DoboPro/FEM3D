import { Injectable } from '@angular/core';
import { RectSection } from './RectSection';

@Injectable({
  providedIn: 'root'
})
export class Material {

  public KS_RECT = 5 / 6;	

  // 材料
  public label: number; // 材料番号
  public ee: number; // ヤング率 (縦弾性係数) 
  public nu: number; // ポアソン比
  public dens: number; // 密度
  public hCon: number; // 熱伝導率
  public sHeat: number; // 比熱
  public gg: number;	// 横弾性係数
  public cv: number;		// 体積比熱
  public matrix: any;		// 応力 - 歪マトリックス

  constructor(label: number, ee: number, nu: number, dens: number, hCon: number, sHeat: number) {
    this.label = label;
    this.ee = ee;
    this.nu = nu;
    this.dens = dens;
    this.hCon = hCon;
    this.sHeat = sHeat;
    this.gg = 0.5 * ee / (1 + nu);	// 横弾性係数
    this.cv = dens * sHeat;		// 体積比熱
    this.matrix = null;		// 応力 - 歪マトリックス
  }


  // 平面応力問題の応力 - 歪マトリックスを作成する
  public matrix2Dstres(): number[][] {
    const coef: number = this.ee / (1 - this.nu * this.nu);
    return [[coef, coef * this.nu, 0], [coef * this.nu, coef, 0], [0, 0, this.gg]];
  }

  // 平面歪問題の応力 - 歪マトリックスを作成する
  public matrix2Dstrain(): number[][] {
    const coef: number = this.ee / ((1 + this.nu) * (1 - 2 * this.nu));
    return [[coef * (1 - this.nu), coef * this.nu, 0],
    [coef * this.nu, coef * (1 - this.nu), 0], [0, 0, this.gg]];
  }

  // 軸対称問題の応力 - 歪マトリックスを作成する
  public matrixAxiSymetric(): number[][] {
    const coef: number = this.ee / ((1 + this.nu) * (1 - 2 * this.nu));
    const s1: number = coef * (1 - this.nu);
    const s2: number = coef * this.nu;
    return [[s1, s2, s2, 0], [s2, s1, s2, 0], [s2, s2, s1, 0], [0, 0, 0, this.gg]];
  }

  // 捩り問題の応力 - 歪マトリックスを作成する
  public matrixTorsion(): number[][] {
    return [[this.gg, 0], [0, this.gg]];
  }

  // 3次元問題の応力 - 歪マトリックスを作成する
  public matrix3D(): number[][] {
    const coef: number = this.ee / ((1 + this.nu) * (1 - 2 * this.nu));
    const s1: number = coef * (1 - this.nu);
    const s2: number = coef * this.nu;
    return [[s1, s2, s2, 0, 0, 0], [s2, s1, s2, 0, 0, 0], [s2, s2, s1, 0, 0, 0],
    [0, 0, 0, this.gg, 0, 0], [0, 0, 0, 0, this.gg, 0], [0, 0, 0, 0, 0, this.gg]];
  }

  // シェル要素の応力 - 歪マトリックスを作成する
  public matrixShell(): number[][] {
    const coef: number = this.ee / (1 - this.nu * this.nu);
    const s2: number = coef * this.nu;
    return [[coef, s2, 0, 0, 0], [s2, coef, 0, 0, 0], [0, 0, this.gg, 0, 0],
      [0, 0, 0, this.KS_RECT * this.gg, 0], [0, 0, 0, 0, this.KS_RECT * this.gg]];
  }

  // 材料を表す文字列を返す
  public toString(): string {
    return 'Material\t' + this.label.toString(10) + '\t' +
      this.ee + '\t' + this.nu + '\t' + this.gg + '\t' + this.dens + '\t' +
      this.hCon + '\t' + this.sHeat;
  }


  // 平面応力問題の応力 - 歪マトリックスを作成する
  public matrix2Dstress() {
    var coef = this.ee / (1 - this.nu * this.nu);
    return [[coef, coef * this.nu, 0], [coef * this.nu, coef, 0], [0, 0, this.gg]];
  }
}