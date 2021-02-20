import { Injectable } from '@angular/core';
import { BoundaryCondition } from './boundary/BoundaryCondition';
import { Strain } from './stress/Strain';
import { Stress } from './stress/Stress';
import { Vector3R } from './load_restaint/Vector3R';
import { View } from './View';
import { SceneService } from '../components/three/scene.service';

@Injectable({
  providedIn: 'root',
})
export class ColorBar {
  canvasElement: HTMLCanvasElement;
  deviceRatio: number;
  context: any;
  Width: number;
  Height: number;
  gradient: any;
  rect: any;
  maxPos: any;
  minPos: any;

  constructor(private scene: SceneService) {}

  public OnInit(): void {
    this.scene.createRender(
      this.canvasElement,
      this.deviceRatio,
      this.Width,
      this.Height
    );
    const d = (this.Width / 5).toString();
    const e = (this.Height / 10).toString();
    const f = (this.Width * (3 / 10)).toString();
    const g = (this.Height * (4 / 5)).toString();
    this.rect = {
      x: parseInt(d), // カラーバーの描画領域
      y: parseInt(e),
      width: parseInt(f),
      height: parseInt(g),
    };
    this.gradient = this.context.createLinearGradient(
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
    //this.OnInit();
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
    this.context.fillText(this.numString(maxValue), this.maxPos.x, this.maxPos.y);
    this.context.fillText(this.numString(minValue), this.minPos.x, this.minPos.y);
  }

   numString(value){
    var vabs=Math.abs(value);
    if(vabs>=1.0E5){
      return value.toExponential(4);
    }
    else if((vabs>=1) || (vabs===0)){
      return value.toFixed(3);
    }
    else if(vabs>=0.01){
      return value.toFixed(4);
    }
    else{
      return value.toExponential(4);
    }
  }
}
