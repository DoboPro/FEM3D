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

  // remove(){
  //   let i,child;
  //   if(this.model.mesh!==null){
  //     this.removeObject(this.model.mesh);
  //     this.model.mesh.geometry_mesh.dispose();
  //    // this.model.mesh.material.dispose();
  //     this.model.mesh=null;
  //   }
    // if(this.edge!==null){
    //   viewModel.removeObject(this.edge);
    //   this.edge.geometry.dispose();
    //   this.edge.material.dispose();
    //   this.edge=null;
    // }
    // if(this.bar!==null){
    //   this.bar.removeObject();
    //   this.bar=null;
    // }
    // if(this.rest!==null){
    //   for(i=this.rest.children.length-1;i>=0;i--){
    //     this.rest.children[i].removeChildren();
    //     this.rest.remove(this.rest.children[i]);
    //   }
    //   this.rest=null;
    // }
    // if(this.load!==null){
    //   this.removeAllows(this.load);
    //   this.load=null;
    // }
    // if(this.press!==null){
    //   this.removeAllows(this.press);
    //   this.press=null;
    // }
    // if(this.htc!==null){
    //   this.removeAllows(this.htc);
    //   this.htc=null;
    // }
    // if(this.temp!==null){
    //   viewModel.removeObject(this.temp);
    //   for(i=this.temp.children.length-1;i>=0;i--){
    //     child=this.temp.children[i];
    //     child.geometry.dispose();
    //     child.material.dispose();
    //     this.temp.remove(child);
    //   }
    //   this.temp=null;
    // }
  // };

  // public removeObject(obj){
  //   const scene = new THREE.Scene();	
  //   scene.remove(obj)
  // }
}
