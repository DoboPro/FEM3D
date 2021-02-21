"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.ThreeComponent = void 0;
var core_1 = require("@angular/core");
var THREE = require("three");
var ThreeComponent = /** @class */ (function () {
    // private get context(): HTMLCanvasElement{
    //   return this.canvasRef.nativeElement.getContext("2d");
    // }
    function ThreeComponent(ngZone, scene, three) {
        this.ngZone = ngZone;
        this.scene = scene;
        this.three = three;
        THREE.Object3D.DefaultUp.set(0, 0, 1);
    }
    Object.defineProperty(ThreeComponent.prototype, "canvas", {
        get: function () {
            return this.canvasRef.nativeElement;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ThreeComponent.prototype, "context", {
        get: function () {
            var canvass = this.canvasRef.nativeElement;
            return HTMLCanvasElement.prototype.getContext('2d');
        },
        enumerable: false,
        configurable: true
    });
    ;
    ThreeComponent.prototype.ngAfterViewInit = function () {
        this.scene.OnInit(this.getAspectRatio(), this.canvas, 
        // this.context,
        devicePixelRatio, window.innerWidth, window.innerHeight);
        // ラベルを表示する用のレンダラーを HTML に配置する
        var element = this.scene.RendererDomElement();
        var div = document.getElementById('myCanvas'); // ボタンを置きたい場所の手前の要素を取得
        div.parentNode.insertBefore(element, div.nextSibling); // ボタンを置きたい場所にaタグを追加
        // レンダリングする
        this.animate();
    };
    ThreeComponent.prototype.animate = function () {
        var _this = this;
        // We have to run this outside angular zones,
        // because it could trigger heavy changeDetection cycles.
        this.ngZone.runOutsideAngular(function () {
            window.addEventListener('DOMContentLoaded', function () {
                _this.scene.render();
            });
        });
    };
    // マウスクリック時のイベント
    ThreeComponent.prototype.onMouseDown = function (event) {
        var mouse = this.getMousePosition(event);
        this.three.detectObject(mouse, 'click');
    };
    // マウスクリック時のイベント
    ThreeComponent.prototype.onMouseUp = function (event) {
        var mouse = this.getMousePosition(event);
        this.three.detectObject(mouse, 'select');
    };
    // マウス移動時のイベント
    ThreeComponent.prototype.onMouseMove = function (event) {
        var mouse = this.getMousePosition(event);
        this.three.detectObject(mouse, 'hover');
    };
    // マウス位置とぶつかったオブジェクトを検出する
    ThreeComponent.prototype.getMousePosition = function (event) {
        event.preventDefault();
        var rect = this.scene.getBoundingClientRect();
        var mouse = new THREE.Vector2();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        return mouse;
    };
    // ウインドウがリサイズした時のイベント処理
    ThreeComponent.prototype.onResize = function (event) {
        this.scene.onResize(this.getAspectRatio(), window.innerWidth, window.innerHeight - 120);
    };
    ThreeComponent.prototype.getAspectRatio = function () {
        if (this.canvas.clientHeight === 0) {
            return 0;
        }
        return this.canvas.clientWidth / this.canvas.clientHeight;
    };
    __decorate([
        core_1.ViewChild('myCanvas', { static: true })
    ], ThreeComponent.prototype, "canvasRef");
    __decorate([
        core_1.HostListener('mousedown', ['$event'])
    ], ThreeComponent.prototype, "onMouseDown");
    __decorate([
        core_1.HostListener('mouseup', ['$event'])
    ], ThreeComponent.prototype, "onMouseUp");
    __decorate([
        core_1.HostListener('mousemove', ['$event'])
    ], ThreeComponent.prototype, "onMouseMove");
    __decorate([
        core_1.HostListener('window:resize', ['$event'])
    ], ThreeComponent.prototype, "onResize");
    ThreeComponent = __decorate([
        core_1.Component({
            selector: 'app-three',
            templateUrl: './three.component.html',
            styleUrls: ['./three.component.scss']
        })
    ], ThreeComponent);
    return ThreeComponent;
}());
exports.ThreeComponent = ThreeComponent;
