import { Injectable } from '@angular/core';
import { SceneService } from '../scene.service';
// import { InputNodesService } from "../../../components/input/input-nodes/input-nodes.service";
// import { InputMembersService } from "../../../components/input/input-members/input-members.service";
// import { ThreeNodesService } from "./three-nodes.service";
import * as THREE from 'three';
import { CSS2DObject } from '../libs/CSS2DRenderer.js';
import { Vector3 } from 'three';
import { MeshModel } from 'src/app/providers/mesh/MeshModel';
import { Result } from 'src/app/providers/Result';
import { Bounds } from 'src/app/providers/Bounds';

@Injectable({
  providedIn: 'root',
})
export class ThreeDispService {
  private geometry: THREE.CylinderBufferGeometry;

  public maxDistance: number;
  public minDistance: number;

  private dispList: THREE.Object3D;
  private axisList: THREE.Group[]; // 軸は、メンバーのスケールと関係ないので、分けて管理する
  private selectionItem: THREE.Object3D; // 選択中のアイテム

  // 大きさを調整するためのスケール
  private scale: number;
  private params: any; // GUIの表示制御
  private gui: any;

  public dcoef:number = 0.1;

  private objVisible: boolean;
  private txtVisible: boolean;

  private gui_max_scale: number =10;

  constructor(
    private scene: SceneService,
    private mesh: MeshModel,
    private result:Result,
    private bounds: Bounds,
    // private solver:Solver
  ) // private nodeThree: ThreeNodesService,
  // private node: InputNodesService,
  // private member: InputMembersService
  {
    this.geometry = new THREE.CylinderBufferGeometry();
    this.dispList = new THREE.Object3D();
    this.axisList = new Array();
    //this.ClearData();
    this.scene.add(this.dispList);

    this.objVisible = true;
    //this.txtVisible = false;

    // gui
    this.scale = this.dcoef;
    this.params = {
      //memberNo: this.txtVisible,
      //dispScale: this.scene.dcoef//this.scale,
      dispScale:this.scale
    };
    this.gui = null;
  }

  // // 要素の太さを決定する基準値
  // public baseScale(): number {
  //   const scale = 10; //もとはthis.nodeThree.baseScale 100は仮の値（適当）
  //   return scale * 0.3;
  // }

  // スケールを反映する
  private onResize(): void {
    const disp = this.result.displacement;
    const coef = this.dcoef * Math.min(this.bounds.size / this.result.dispMax, 1 / this.result.angleMax);
    if (disp.length === 0) return;
    this.setGeomDisplacement1(this.mesh.geometry_mesh, disp,coef);
    this.setGeomDisplacement2(this.mesh.geometry_edge, disp,coef);
  }

  public setGeomDisplacement1(geometry_mesh, disp,coef) {
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

  public setGeomDisplacement2(geometry_edge, disp,coef) {
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


  // 表示設定を変更する
  public visibleChange(flag: boolean, text: boolean, gui: boolean): void {
    // 表示設定
    if (this.objVisible !== flag) {
      this.dispList.visible = flag;
      this.objVisible = flag;
    }

    // // 部材軸の表示設定
    // if (text === false) {
    //   // テキストが非表示なら部材軸の表示も消す
    //   for (const group of this.axisList) {
    //     group.visible = false;
    //   }
    // }

    // guiの表示設定
    if (gui === true) {
      this.guiEnable();
    } else {
      // 黒に戻す
      this.selectionItem = null;
      this.dispList.children.map((item) => {
        // 元の色にする
        const material = item['material'];
        material['color'].setHex(0x000000);
        material['opacity'] = 1.0;
      });
      this.axisList.map((item) => {
        item.visible = false;
      });
      this.guiDisable();
    }
  }

  // guiを表示する
  private guiEnable(): void {
    if (this.gui !== null) {
      return;
    }

    // this.gui = this.scene.gui
    //   .add(this.params, "dispScale", 0, 1000)
    // .step(1)
    const gui_step: number = this.gui_max_scale * 0.001;
    this.gui = this.scene.gui
      .add(this.params, 'dispScale', 0, this.gui_max_scale)
      .step(gui_step)
      .onChange((value) => {
        this.dcoef = value;
        this.onResize();
        this.scene.render();
      });
      console.log("disp",gui_step)
  }

  // guiを非表示にする
  private guiDisable(): void {
    if (this.gui === null) {
      return;
    }
    this.scene.gui.remove(this.gui);
    this.gui = null;
  }
}
