import { Injectable } from '@angular/core';
import { SceneService } from '../scene.service';
// import { InputNodesService } from "../../../components/input/input-nodes/input-nodes.service";
// import { InputMembersService } from "../../../components/input/input-members/input-members.service";
// import { ThreeNodesService } from "./three-nodes.service";
import * as THREE from 'three';
import { CSS2DObject } from '../libs/CSS2DRenderer.js';
import { Vector3 } from 'three';

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

  public dcoef:number = 10;

  private objVisible: boolean;
  private txtVisible: boolean;

  private gui_max_scale: number =10;

  constructor(
    private scene: SceneService,
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
    this.scale = 0.5;
    this.params = {
      //memberNo: this.txtVisible,
      //dispScale: this.scene.dcoef//this.scale,
      dispScale:this.scale
    };
    this.gui = null;
  }

  // 要素の太さを決定する基準値
  public baseScale(): number {
    const scale = 10; //もとはthis.nodeThree.baseScale 100は仮の値（適当）
    return scale * 0.3;
  }

  // スケールを反映する
  private onResize(): void {
    let sc = this.scale / 100; // this.scale は 100 が基準値なので、100 のとき 1 となるように変換する
    sc = Math.max(sc, 0.001); // ゼロは許容しない

    let scale: number = this.baseScale() * sc;

    for (const item of this.dispList.children) {
      item.scale.set(scale, 1, scale);
    }
    scale *= 50;
    for (const arrows of this.axisList) {
      for (const item of arrows.children) {
        item.scale.set(scale, scale, scale);
      }
    }
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
        this.scale = value;
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
