import { Injectable } from '@angular/core';
import { BoundsService } from '../components/three/geometry/bounds.service';
import { RoundService } from '../components/three/geometry/round.service';
import { ThreeService } from '../components/three/three.service';
import { FemDataModel } from './FemDataModel';
import { FileIO } from './FileIO';

@Injectable({
  providedIn: 'root',
})

//--------------------------------------------------------------------//
// 3次元有限要素法(FEM)
export class FemMainService {
  modalWindow: any;
  info: any;

  constructor(
    private model: FemDataModel,
    private viewModel: ThreeService,
    private fileio: FileIO
  ) {}

  // データを初期化する
  // fileName - データファイル名
  public initModel(fileName: string = null) {
    this.model.clear();
    this.viewModel.ClearData();
    if (fileName !== null && fileName !== undefined) {
      this.fileio.readServerFemFile(fileName);
    }
    this.loop();
  }

  loop() {
    throw new Error('Method not implemented.');
  }

 
}
