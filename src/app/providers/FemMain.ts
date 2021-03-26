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
    this.model.clear();
    this.viewModel.ClearData();
    // this.remove();
    if (fileName !== null && fileName !== undefined) {
      this.fileio.readServerFemFile(fileName);
    }
  }
}
