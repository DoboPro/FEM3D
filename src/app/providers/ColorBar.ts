import { Injectable } from '@angular/core';
import { BoundaryCondition } from './boundary/BoundaryCondition';
import { Strain } from './stress/Strain';
import { Stress } from './stress/Stress';
import { Vector3R } from './load_restaint/Vector3R';
import { View } from './View';
import * as THREE from 'three';
import { SceneService } from '../components/three/scene.service';
import { Stats } from '../components/three/libs/stats.module.js';

@Injectable({
  providedIn: 'root',
})
export class ColorBar {
  canvasElement: HTMLCanvasElement;
  deviceRatio: number;
  Width: number;
  Height: number;
  gradient: any;
  rect: any;
  maxPos: any;
  minPos: any;
  aspectRatio: number;
  context: any;
  a: any;
  b: any;
  c: any;
  d: any;

  constructor(private scene:SceneService) {}

  public OnInit(): void {
    const d = (this.b / 5).toString();
    const e = (this.c / 10).toString();
    const f = (this.b * (3 / 10)).toString();
    const g = (this.c * (4 / 5)).toString();
    this.rect = {
      x: parseInt(d), // カラーバーの描画領域
      y: parseInt(e),
      width: parseInt(f),
      height: parseInt(g),
    };

    const canvas2 = <HTMLCanvasElement>document.getElementById('myCanvas');
    const ctx: CanvasRenderingContext2D = canvas2.getContext('2d');
    console.log(ctx);

    const context = this.canvasElement.getContext('2d');
    this.gradient = context.createLinearGradient(
      this.rect.x,
      this.rect.y + this.rect.height,
      this.rect.x,
      this.rect.y
    );
    this.gradient.addColorStop(0, '#0000ff');
    this.gradient.addColorStop(0.25, '#00ffff');
    this.gradient.addColorStop(0.5, '#00cc00');
    this.gradient.addColorStop(0.75, '#ffff00');
    this.gradient.addColorStop(1, '#ff0000');
    const xt: number = this.rect.x + this.rect.width + 5;
    // 数値表示位置
    var CBAR_FONT_SIZE = 14; // フォントサイズ
    const h = (this.rect.y - CBAR_FONT_SIZE / 2).toString();
    this.maxPos = { x: xt, y: parseInt(h) };
    this.minPos = { x: xt, y: this.maxPos.y + this.rect.height };
  }

  draw(minValue, maxValue) {
   // this.OnInit();
    const z = this.scene.draw(this.a,this.b,this.c);
    console.log(z)
    var FG_COLOR = '#ffffff'; // 前景色
    this.context.clearRect(0, 0, this.Width, this.Height);
    this.context.fillStyle = this.gradient;
    this.context.fillRect(
      this.rect.x,
      this.rect.y,
      this.rect.width,
      this.rect.height
    );
    this.context.strokeStyle = FG_COLOR;
    this.context.strokeRect(
      this.rect.x,
      this.rect.y,
      this.rect.width,
      this.rect.height
    );
    this.context.fillStyle = FG_COLOR;
    this.context.fillText(
      this.numString(maxValue),
      this.maxPos.x,
      this.maxPos.y
    );
    this.context.fillText(
      this.numString(minValue),
      this.minPos.x,
      this.minPos.y
    );
  }

  numString(value) {
    var vabs = Math.abs(value);
    if (vabs >= 1.0e5) {
      return value.toExponential(4);
    } else if (vabs >= 1 || vabs === 0) {
      return value.toFixed(3);
    } else if (vabs >= 0.01) {
      return value.toFixed(4);
    } else {
      return value.toExponential(4);
    }
  }
}
