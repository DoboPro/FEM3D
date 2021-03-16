import { AfterViewInit, Component, ElementRef, ViewChild, HostListener, NgZone } from '@angular/core';
import * as THREE from 'three';

import { SceneService } from './scene.service';
import { ThreeService } from './three.service';


@Component({
  selector: 'app-three',
  templateUrl: './three.component.html',
  styleUrls: ['./three.component.scss']
})
export class ThreeComponent implements AfterViewInit {
  rect:any;

  @ViewChild('myCanvas', { static: true }) private canvasRef: ElementRef;

  private get canvas(): HTMLCanvasElement {
    return this.canvasRef.nativeElement;
  }

  constructor(private ngZone: NgZone,
              private scene: SceneService,
              private three: ThreeService) { 
    THREE.Object3D.DefaultUp.set(0, 0, 1);
  }

  ngAfterViewInit() {
    this.scene.OnInit(this.getAspectRatio(),
      this.canvas,
      devicePixelRatio,
      window.innerWidth,
      window.innerHeight);

    // ラベルを表示する用のレンダラーを HTML に配置する
    const element = this.scene.RendererDomElement();
    const div = document.getElementById('myCanvas');        // ボタンを置きたい場所の手前の要素を取得
    div.parentNode.insertBefore(element, div.nextSibling);  // ボタンを置きたい場所にaタグを追加

    // レンダリングする
    this.animate();
  }

  animate(): void {
    // We have to run this outside angular zones,
    // because it could trigger heavy changeDetection cycles.
    this.ngZone.runOutsideAngular(() => {
      window.addEventListener('DOMContentLoaded', () => {
        this.scene.render();
      });
    });
  }

  // マウスクリック時のイベント
  @HostListener('mousedown', ['$event'])
  public onMouseDown(event: MouseEvent) {
    const mouse: THREE.Vector2 = this.getMousePosition(event);
    this.three.detectObject(mouse, 'click');
  }

  // マウスクリック時のイベント
  @HostListener('mouseup', ['$event'])
  public onMouseUp(event: MouseEvent) {
    const mouse: THREE.Vector2 = this.getMousePosition(event);
    this.three.detectObject(mouse, 'select');
  }

  // マウス移動時のイベント
  @HostListener('mousemove', ['$event'])
  public onMouseMove(event: MouseEvent) {
    const mouse: THREE.Vector2 = this.getMousePosition(event);
    this.three.detectObject(mouse, 'hover');
  }

  // マウス位置とぶつかったオブジェクトを検出する
  private getMousePosition(event: MouseEvent): THREE.Vector2 {
    event.preventDefault();
    const rect = this.scene.getBoundingClientRect();
    const mouse = new THREE.Vector2();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = - ((event.clientY - rect.top) / rect.height) * 2 + 1;
    return mouse;
  }

  // ウインドウがリサイズした時のイベント処理
  @HostListener('window:resize', ['$event'])
  public onResize(event: Event) {
    this.scene.onResize(this.getAspectRatio(),
      window.innerWidth,
      window.innerHeight - 120);
  }

  private getAspectRatio(): number {
    if (this.canvas.clientHeight === 0) {
      return 0;
    }
    return this.canvas.clientWidth / this.canvas.clientHeight;
  }

  
  colorbar(d,e,f){
    const a = this.canvas;
    const b = window.innerWidth;
    const c = window.innerHeight;
    // this.context= a.getContext('2d');		// コンテキスト
    // this.context.font=CBAR_FONT;
    // this.context.textBaseline='top';
   
    return {a,b,c}
    
  }

  // ngOnInit(){
  //  this.three.ChangeMode('disp');
  // }

}
