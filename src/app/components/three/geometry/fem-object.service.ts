import { Injectable } from '@angular/core';
import { HexaElement1 } from 'src/app/providers/elements/HexaElement1';
import { Load } from 'src/app/providers/load_restaint/Load';
import { Restraint } from 'src/app/providers/load_restaint/Restraint';
import { FENode } from 'src/app/providers/mesh/FENode';
import { Result } from 'src/app/providers/Result';
import * as THREE from 'three';
import { FemDataModel } from '../../../providers/FemDataModel';
import { FileIO } from '../../../providers/FileIO';
import { ThreeService } from '../../three/three.service';

@Injectable({
  providedIn: 'root',
})
export class FemObjectService {
  label: number;
  x: number;
  y: number;
  z: number;
  NODE_DATA: number = 0;
  ELEMENT_DATA: number = 0;

  constructor(
    private model: FemDataModel,
    private viewModel: ThreeService,
    private fileio: FileIO,
    private resultView: Result
  ) {}

  // データを初期化する
  // fileName - データファイル名
  // public initModel(fileName: string = null) {
  //   this.model.clear();
  //   this.viewModel.ClearData();
  //   if (fileName !== null && fileName !== undefined) {
  //     this.fileio.readServerFemFile(fileName);
  //   }
  //   this.loop();
  // }

  // loop() {
  //   throw new Error('Method not implemented.');
  // }

  // ローカルファイルを読み込む
  // readLocalFile(d) {
  //   let file = (<HTMLInputElement>document.getElementById('localreadfile')).files[0];
  //   let dfa = file.split(/\r?\n/g);
  // var reader=new FileReader();
  // reader.readAsText(file);
  // reader.onload=function(e){
  //   try{
  //     readFemModel(file.split(/\r?\n/g));
  //   }
  //   catch(ex){
  //     alert(ex);
  //   }
  // };

  // }

  public readLocalFile(d): any {
    let file = (<HTMLInputElement>document.getElementById('localreadfile'))
      .files[0];
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = function (e) {
      this.readFemModel (
        (reader.result as string).split(/\r?\n/g)
      );
    };
    
    return new Promise((resolve, reject) => {
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.onerror = () => {
        reject(reader.error);
      };
    });
  }

  readFemModel(s) {
    this.model.clear();
    const mesh = this.model.mesh,
      bc = this.model.bc,
      res = [];
    for (var i = 0; i < s.length; i++) {
      const ss = s[i].trim().replace(/\t/g, ' ').split(/\s+/);
      if (ss.length > 0) {
        const keyWord = ss[0].toLowerCase();

        // 節点
        if (keyWord == 'node' && ss.length > 4) {
          mesh.nodes.push(
            new FENode(
              parseInt(ss[1]),
              parseFloat(ss[2]),
              parseFloat(ss[3]),
              parseFloat(ss[4])
            )
          );
        } else if (keyWord == 'hexaelement1' && ss.length > 10) {
          mesh.elements.push(
            new HexaElement1(
              parseInt(ss[1]),
              parseInt(ss[2]),
              this.readVertex(ss, 3, 8)
            )
          );

          // 境界条件
        } else if (keyWord == 'restraint' && ss.length > 7) {
          const rest = this.readRestraint(ss);
          if (rest !== null) bc.restraints.push(rest);
        } else if (keyWord == 'load' && ss.length > 4) {
          bc.loads.push(this.readLoad(ss));
        }
        // 計算結果
        else if (keyWord == 'resulttype' && ss.length > 1) {
          if (ss[1].toLowerCase() == 'element') {
            this.model.result.type = this.ELEMENT_DATA;
          } else {
            this.model.result.type = this.NODE_DATA;
          }
        } else if (
          (keyWord == 'eigenvalue' && ss.length > 2) ||
          (keyWord == 'displacement' && ss.length > 7) ||
          (keyWord == 'strain1' && ss.length > 7) ||
          (keyWord == 'stress1' && ss.length > 7) ||
          (keyWord == 'strenergy1' && ss.length > 2) ||
          (keyWord == 'strain2' && ss.length > 7) ||
          (keyWord == 'stress2' && ss.length > 7) ||
          (keyWord == 'strenergy2' && ss.length > 2) ||
          (keyWord == 'temp' && ss.length > 2)
        ) {
          res.push(ss);
        }
      }
    }
    this.model.init();
    //initObject();
    if (res.length > 0) {
      this.readFemResult(res);
    }
  }

  // 節点
  // label - 節点ラベル
  // x,y,z - x,y,z座標
  FENode(label, x, y, z) {
    THREE.Vector3.call(this, x, y, z);
    this.label = label;
  }

  readVertex(ss, is, count) {
    var vertex = [];
    for (var j = 0; j < count; j++) vertex[j] = parseInt(ss[is + j]);
    return vertex;
  }

  // 拘束条件を読み込む
  // ss - データ文字列配列
  readRestraint(ss) {
    var rx = parseInt(ss[2]) !== 0;
    var ry = parseInt(ss[4]) !== 0;
    var rz = parseInt(ss[6]) !== 0;
    var x = parseFloat(ss[3]),
      y = parseFloat(ss[5]),
      z = parseFloat(ss[7]);
    var coords = null;
    if (ss.length < 14) {
      if (ss.length > 8) coords = parseInt(ss[8]);
      if (!rx && !ry && !rz) return null;
      return new Restraint(parseInt(ss[1]), coords, rx, ry, rz, x, y, z);
    } else {
      if (ss.length > 14) coords = parseInt(ss[14]);
      var rrx = parseInt(ss[8]) !== 0;
      var rry = parseInt(ss[10]) !== 0;
      var rrz = parseInt(ss[12]) !== 0;
      if (!rx && !ry && !rz && !rrx && !rry && !rrz) return null;
      return new Restraint(
        parseInt(ss[1]),
        coords,
        rx,
        ry,
        rz,
        x,
        y,
        z,
        rrx,
        rry,
        rrz,
        parseFloat(ss[9]),
        parseFloat(ss[11]),
        parseFloat(ss[13])
      );
    }
  }

  // 荷重条件を読み込む
  // ss - データ文字列配列
  readLoad(ss) {
    var coords = null;
    if (ss.length < 8) {
      if (ss.length > 5) coords = parseInt(ss[5]);
      return new Load(
        parseInt(ss[1]),
        coords,
        parseFloat(ss[2]),
        parseFloat(ss[3]),
        parseFloat(ss[4])
      );
    } else {
      if (ss.length > 8) coords = parseInt(ss[8]);
      return new Load(
        parseInt(ss[1]),
        coords,
        parseFloat(ss[2]),
        parseFloat(ss[3]),
        parseFloat(ss[4]),
        parseFloat(ss[5]),
        parseFloat(ss[6]),
        parseFloat(ss[7])
      );
    }
  }

  // FEMの計算結果を読み込む
  // s - データ文字列のリスト
  readFemResult(s) {
    var map1 = [],
      map2 = [],
      ss = [],
      res = this.model.result,
      p,
      i;
    var nodes = this.model.mesh.nodes,
      elems = this.model.mesh.elements;
    for (i = 0; i < nodes.length; i++) {
      map1[nodes[i].label] = i;
    }
    if (res.type === this.ELEMENT_DATA) {
      for (i = 0; i < elems.length; i++) {
        map2[elems[i].label] = i;
      }
    } else {
      map2 = map1;
    }
    for (i = 0; i < s.length; i++) {
      var keyWord = s[i][0].toLowerCase();
      ss.length = 0;
      for (var j = 2; j < s[i].length; j++) {
        ss[j - 2] = parseFloat(s[i][j]);
      }
      // if(keyWord=='eigenvalue'){
      //   var ev=new EigenValue(ss[0],s[i][1]);
      //   this.model.result.addEigenValue(ev);
      //   res=ev;
      // }
      // else if(keyWord=='displacement'){
      //   p=readDataPointer(s[i],map1);
      //   var d=new Vector3R(ss[0],ss[1],ss[2],ss[3],ss[4],ss[5]);
      //   res.displacement[p]=d;
      //   res.dispMax=Math.max(res.dispMax,d.magnitude());
      //   res.angleMax=Math.max(res.angleMax,d.magnitudeR());
      // }
      // else if(keyWord=='strain1'){
      //   p=readDataPointer(s[i],map2);
      //   this.model.result.strain1[p]=new Strain(ss);
      // }
      // else if(keyWord=='stress1'){
      //   p=readDataPointer(s[i],map2);
      //   this.model.result.stress1[p]=new Stress(ss);
      // }
      // else if(keyWord=='strenergy1'){
      //   p=readDataPointer(s[i],map2);
      //   res.sEnergy1[p]=ss[0];
      // }
      // else if(keyWord=='strain2'){
      //   p=readDataPointer(s[i],map2);
      //   this.model.result.strain2[p]=new Strain(ss);
      // }
      // else if(keyWord=='stress2'){
      //   p=readDataPointer(s[i],map2);
      //   this.model.result.stress2[p]=new Stress(ss);
      // }
      // else if(keyWord=='strenergy2'){
      //   p=readDataPointer(s[i],map2);
      //   res.sEnergy2[p]=ss[0];
      // }
      // else if(keyWord=='temp'){
      //   p=readDataPointer(s[i],map1);
      //   this.model.result.temperature[p]=ss[0];
      //   this.model.result.tempMax=Math.max(this.model.result.tempMax,ss[0]);
      // }
    }
    this.model.result.calculated = true;
    if (this.model.result.eigenValue.length === 0) {
      this.resultView.setInitStatic();
      // showInfo();
    } else {
      this.resultView.setInitEigen();
    }
  }

  // 節点のコピーを返す
  // FENode.prototype.clone=function(){
  //   return this.label,this.x,this.y,this.z;
  // };

  // 節点を表す文字列を返す
  // FENode.prototype.toString=function(){
  //   return 'Node\t'+this.label.toString(10)+'\t'+
  //       	 this.x+'\t'+this.y+'\t'+this.z;
  // };
}
