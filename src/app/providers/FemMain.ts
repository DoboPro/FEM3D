import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { ThreeService } from '../components/three/three.service';
import { FemDataModel } from './FemDataModel';
import { FileIO } from './FileIO';
import { MeshModel } from './mesh/MeshModel';

@Injectable({
  providedIn: 'root',
})

//--------------------------------------------------------------------//
// 3次元有限要素法(FEM)
export class FemMainService {
  geometry_mesh: any;
  geometry_edge: any;

  constructor(
    private model: FemDataModel,
    private viewModel: ThreeService,
    private fileio: FileIO,
    private mesh : MeshModel
  ) {}

  // データを初期化する
  // fileName - データファイル名
  public initModel(fileName: string = null) {
    this.model.clear();　//前回データの計算処理上必要な部分の初期化
    this.viewModel.ClearData();　//前回データのthree.js(物体を書くためのjs)データの初期化
    if (fileName !== null && fileName !== undefined) {
      this.fileio.readFemFile(fileName);　//　femファイルの取り込み開始
    }
  }
}
