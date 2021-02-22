import { Injectable } from '@angular/core';

import { BoundaryCondition } from './boundary/BoundaryCondition';
// import { FemDataModel } from './FemDataModel';
// import { Result } from './Result';
import { MeshModel } from './mesh/MeshModel';
// import { SceneService } from '../components/three/scene.service';

@Injectable({
  providedIn: 'root',
})

// 連立方程式求解オブジェクト
export class View {
  public PRECISION = 1e-10; // マトリックス精度
  public LU_METHOD = 0; // LU分解法
  public ILUCG_METHOD = 1; // 不完全LU分解共役勾配法

  public matrix: any[]; // 行列
  public matrix2: any[]; // 第２行列
  public vector: any[]; // ベクトル
  public dof: number; // モデル自由度
  public method: number; // 方程式解法

  disp:any;
  minValue:number;
  maxValue:number;

  cls: any[];
  cls1: any[];

  constructor(
    // private model: FemDataModel,
    private mesh: MeshModel,
    // private scene: SceneService,
    // private result: Result
  ) {}

  public setDisplacement(disp) {
    if (disp.length === 0) return;
    this.setGeomDisplacement1(this.mesh.geometry_mesh, disp);
    this.setGeomDisplacement2(this.mesh.geometry_edge, disp);
  }

  public setGeomDisplacement1(geometry_mesh, disp) {
    const coef = 0.1;
    const label = geometry_mesh.nodes,
      nodes = this.mesh.nodes,
      angle = geometry_mesh.angle;
    const pos = geometry_mesh.attributes.position.array;
    for (let i = 0; i < label.length; i++) {
      let i3 = 3 * i,
        p = nodes[label[i]],
        dx = disp[label[i]].x;
      console.log(pos[i3]);
      pos[i3] = p.x + coef * dx[0];
      pos[i3 + 1] = p.y + coef * dx[1];
      pos[i3 + 2] = p.z + coef * dx[2];
      angle[i3] = coef * dx[3];
      angle[i3 + 1] = coef * dx[4];
      angle[i3 + 2] = coef * dx[5];
    }
    geometry_mesh.attributes.position.needsUpdate = true;
  }

  public setGeomDisplacement2(geometry_edge, disp) {
    const coef = 0.1;
    const label = geometry_edge.nodes,
      nodes = this.mesh.nodes,
      angle = geometry_edge.angle;
    const pos = geometry_edge.attributes.position.array;
    for (let i = 0; i < label.length; i++) {
      let i3 = 3 * i,
        p = nodes[label[i]],
        dx = disp[label[i]].x;
      pos[i3] = p.x + coef * dx[0];
      pos[i3 + 1] = p.y + coef * dx[1];
      pos[i3 + 2] = p.z + coef * dx[2];
      angle[i3] = coef * dx[3];
      angle[i3 + 1] = coef * dx[4];
      angle[i3 + 2] = coef * dx[5];
    }
    geometry_edge.attributes.position.needsUpdate = true;
  }

  public setContour(value,minValue,maxValue){
    var coef=1;
    if(maxValue!==minValue) coef=1/(maxValue-minValue);
     this.setGeomContour(this.mesh.geometry_mesh,value,minValue,coef);
   // this.bar.setContour(value,minValue,coef,type);
  };

  
  // 形状データのコンター図を設定する
  // geometry - 対象となる形状データ
  // value - コンター図データ
  // minValue - コンター図データ最小値
  // coef - データ変換係数
  // type - データ保持形態
  public setGeomContour(geometry_mesh, value , minValue, coef) {
    const colors_mesh = geometry_mesh.attributes.color.array;
  

    const label_mesh = geometry_mesh.nodes;

    for (var i = 0; i < label_mesh.length; i++) {
      let i3 = 3 * i,
        d1 = coef * (value[label_mesh[i]] - minValue);
      this.cls1 = this.contourColor_mesh(d1);
      colors_mesh[i3] =     this.cls1[0];
      colors_mesh[i3 + 1] = this.cls1[1];
      colors_mesh[i3 + 2] = this.cls1[2];
    }
    geometry_mesh.attributes.color.needsUpdate = true;
  }

  // コンター図の色を返す
  // z - 0～1の値
  contourColor_mesh(z) {
    let cls = [0,0,0];
    cls[0] = 0;
    cls[1] = 0;
    cls[2] = 0;
    if (z <= 0) {
      cls[2] = 1;
    } else if (z < 0.25) {
      cls[1] = 4 * z;
      cls[2] = 1;
    } else if (z < 0.5) {
      cls[1] = 1.2 - 0.8 * z;
      cls[2] = 2 - 4 * z;
    } else if (z < 0.75) {
      cls[0] = 4 * z - 2;
      cls[1] = 0.4 + 0.8 * z;
    } else if (z < 1) {
     cls[0] = 1;
     cls[1] = 4 - 4 * z;
    } else {
     cls[0] = 1;
    }
    return cls;
  }
  
}
