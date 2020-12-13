import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

//--------------------------------------------------------------------//
// シェルパラメータ
// label - パラメータ番号
// thickness - 厚さ
export class ShellParameter {

  public label: number;
  public thickness: number;

  constructor(label: number, thickness: number) {
    this.label = label;
    this.thickness = thickness;
  }

  // シェルパラメータを表す文字列を返す
  public toString(): string {
    return 'ShellParameter\t' + this.label.toString(10) + '\t' + this.thickness;
  }
}
