import { Injectable } from '@angular/core';
import { SceneService } from '../scene.service';
import * as THREE from 'three';
import { MeshModel } from 'src/app/providers/mesh/MeshModel';
import { Result } from 'src/app/providers/Result';
import { Bounds } from 'src/app/providers/Bounds';
import { View } from 'src/app/providers/View';

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

  public dcoef: number = 0.1;

  private objVisible: boolean;

  private gui_max_scale: number = 10;

  constructor(
    private scene: SceneService,
    private mesh: MeshModel,
    private result: Result,
    private bounds: Bounds,
    private view: View
  ) {
    this.geometry = new THREE.CylinderBufferGeometry();
    this.dispList = new THREE.Object3D();
    this.axisList = new Array();
    //this.ClearData();
    this.scene.add(this.dispList);

    this.objVisible = true;

    // gui
    this.scale = this.dcoef;
    this.params = {
      //dispScale: this.scene.dcoef//this.scale,
      dispScale: this.scale,
    };
    this.gui = null;
  }

  // スケールを反映する
  private onResize(): void {
    const disp = this.result.displacement;
    const coef =
      this.dcoef *
      Math.min(
        this.bounds.size / this.result.dispMax,
        1 / this.result.angleMax
      );
    if (disp.length === 0) return;
    this.view.setGeomDisplacement1(this.mesh.geometry_mesh, disp, coef);
    this.view.setGeomDisplacement2(this.mesh.geometry_edge, disp, coef);
  }

  // 表示設定を変更する
  public visibleChange(flag: boolean, text: boolean, gui: boolean): void {
    // 表示設定
    if (this.objVisible !== flag) {
      this.dispList.visible = flag;
      this.objVisible = flag;
    }

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
    console.log('disp', gui_step);
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
