export class ShellParameter {

  // シェルパラメータ
  public label: number; // パラメータ番号
  public thickness: number; // 厚さ

  constructor(label: number, thickness: number) {
    this.label = label;
    this.thickness = thickness;
   }

  // シェルパラメータを表す文字列を返す
  public toString(): string {
    return 'ShellParameter\t' + this.label.toString(10) + '\t'+this.thickness;
  }

}
