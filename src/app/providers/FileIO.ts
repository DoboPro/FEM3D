import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Load } from './load_restaint/Load';
import { Restraint } from './load_restaint/Restraint';
import { FENode } from './mesh/FENode';
import { Material } from './material/Material';
import { ShellParameter } from './parameter/ShellParameter';
import { QuadElement1 } from './elements/QuadElement1';
import { FemDataModel } from './FemDataModel';
import { Coordinates } from './load_restaint/Coordinates';

@Injectable({
  providedIn: 'root'
})
export class FileIO {

  constructor(private http: HttpClient,
              private model: FemDataModel) { }

  // サーバー上のFEMデータファイルを読み込む
  // fileName - データファイル名
  public readServerFemFile(fileName: string) {

    this.http.get(fileName, { responseType: 'text' }).subscribe(
      responseText => {
        this.readFemModel(responseText.split(/\r?\n/g));
      },
      error => {
        console.log(error);
      }
    );
  }

  // FEMデータを読み込む
  // s - データ文字列のリスト
  private readFemModel(s: string[]) {

    this.model.clear();
    const mesh = this.model.mesh;
    const bc = this.model.bc;

    for (let i = 0; i < s.length; i++) {
      const ss: string[] = s[i].trim().replace(/\t/g, ' ').split(/\s+/);

      if (ss.length > 0) {
        const keyWord: string = ss[0].toLowerCase();
        // 材料データ
        if ((keyWord === 'material') && (ss.length > 7)) {
          this.model.materials.push
            (new Material(parseInt(ss[1]), parseFloat(ss[2]),
              parseFloat(ss[3]), parseFloat(ss[5]),
              parseFloat(ss[6]), parseFloat(ss[7])));
        }
        // シェルパラメータ
        else if ((keyWord === 'shellparameter') && (ss.length > 2)) {
          this.model.shellParams.push
            (new ShellParameter(parseInt(ss[1]), parseFloat(ss[2])));
        }
        // 局所座標系
        else if((keyWord=='coordinates') && (ss.length>10)){
          this.model.coordinates.push(this.readCoordinates(ss));
        }
        // 節点
        else if ((keyWord == 'node') && (ss.length > 4)) {
          mesh.nodes.push(new FENode(parseInt(ss[1]), parseFloat(ss[2]),
            parseFloat(ss[3]),
            parseFloat(ss[4])));
        }
        // 要素
        else if ((keyWord == 'quadelement1') && (ss.length > 7)) {
          mesh.elements.push(new QuadElement1
            (parseInt(ss[1]), parseInt(ss[2]), parseInt(ss[3]),
              this.readVertex(ss, 4, 4)));
        }
        // 境界条件
        else if ((keyWord == 'restraint') && (ss.length > 7)) {
          var rest = this.readRestraint(ss);
          if (rest !== null) bc.restraints.push(rest);
        }
        else if ((keyWord == 'load') && (ss.length > 4)) {
          bc.loads.push(this.readLoad(ss));
        }
      }
    }

    this.model.init();
  }


  // データポインタを獲得する
  // ss - データ文字列
  // map - ラベルマップ
  public readDataPointer(ss, map) {
    var p = parseInt(ss[1]);
    if (p in map) {
      return map[p];
    }
    else {
      throw new Error('計算結果' + ss[0] + 'の番号' + p +
        'は存在しません');
    }
  }

  // 節点番号を読み取る
  // ss - 文字列配列
  // is - 開始インデックス
  // count - 節点数
  public readVertex(ss, is, count) {
    var vertex = [];
    for (var j = 0; j < count; j++) {
      vertex[j] = parseInt(ss[is + j]);
    }
    return vertex;
  }

  // 局所座標系を読み込む
  // ss - データ文字列配列
  private readCoordinates(ss){
    const c=[[parseFloat(ss[2]),parseFloat(ss[3]),parseFloat(ss[4])],
             [parseFloat(ss[5]),parseFloat(ss[6]),parseFloat(ss[7])],
             [parseFloat(ss[8]),parseFloat(ss[9]),parseFloat(ss[10])]];
    for(let i=0;i<3;i++){
      const ci=c[i];
      let cf=ci[0]*ci[0]+ci[1]*ci[1]+ci[2]*ci[2];
      if(cf===0){
        throw new Error('座標系'+ss[2]+'の軸方向ベクトルが0です');
      }
      cf=1/Math.sqrt(cf);
      ci[0]*=cf;
      ci[1]*=cf;
      ci[2]*=cf;
    }
    return new Coordinates(parseInt(ss[1]),c[0][0],c[1][0],c[2][0],
                          c[0][1],c[1][1],c[2][1],
                          c[0][2],c[1][2],c[2][2]);
  }

  // 拘束条件を読み込む
  // ss - データ文字列配列
  public readRestraint(ss) {
    const rx = (parseInt(ss[2]) !== 0);
    const ry = (parseInt(ss[4]) !== 0);
    const rz = (parseInt(ss[6]) !== 0);
    const x = parseFloat(ss[3]);
    const y = parseFloat(ss[5]);
    const z = parseFloat(ss[7]);
    var coords = null;
    if (ss.length < 14) {
      if (ss.length > 8) coords = parseInt(ss[8]);
      if (!rx && !ry && !rz) return null;
      return new Restraint(parseInt(ss[1]), coords, rx, ry, rz, x, y, z);
    }
    else {
      if (ss.length > 14) coords = parseInt(ss[14]);
      var rrx = (parseInt(ss[8]) !== 0);
      var rry = (parseInt(ss[10]) !== 0);
      var rrz = (parseInt(ss[12]) !== 0);
      if (!rx && !ry && !rz && !rrx && !rry && !rrz) return null;
      return new Restraint(parseInt(ss[1]), coords,
        rx, ry, rz,
        x, y, z,
        rrx, rry, rrz,
        parseFloat(ss[9]),  parseFloat(ss[11]), parseFloat(ss[13]));
    }
  }

  // 荷重条件を読み込む
  // ss - データ文字列配列
  public readLoad(ss) {
    let coords = null;
    if (ss.length < 8) {
      if (ss.length > 5) coords = parseInt(ss[5]);
      return new Load(parseInt(ss[1]), coords,
                      parseFloat(ss[2]), parseFloat(ss[3]), parseFloat(ss[4]));
    }
    else {
      if (ss.length > 8) coords = parseInt(ss[8]);
      return new Load(parseInt(ss[1]), coords,
                      parseFloat(ss[2]), parseFloat(ss[3]),
                      parseFloat(ss[4]), parseFloat(ss[5]),
                      parseFloat(ss[6]), parseFloat(ss[7]));
    }
  }

}