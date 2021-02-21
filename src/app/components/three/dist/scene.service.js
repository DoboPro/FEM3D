"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.SceneService = void 0;
var core_1 = require("@angular/core");
var THREE = require("three");
var dat_gui_module_js_1 = require("./libs/dat.gui.module.js");
var OrbitControls_js_1 = require("./libs/OrbitControls.js");
//import { ThreeComponent } from './three.component';
var SceneService = /** @class */ (function () {
    // 初期化
    function SceneService() {
        // シーンを作成
        this.scene = new THREE.Scene();
        // シーンの背景を白に設定
        this.scene.background = new THREE.Color(0xf0f0f0);
        // レンダラーをバインド
        this.render = this.render.bind(this);
        // gui
        this.params = {
            GridHelper: true
        };
    }
    SceneService.prototype.OnInit = function (aspectRatio, canvasElement, 
    // context: HTMLCanvasElement,
    deviceRatio, Width, Height) {
        var _this = this;
        // カメラ
        this.createCamera(aspectRatio);
        // 環境光源
        this.add(new THREE.AmbientLight(0xf0f0f0));
        // レンダラー
        this.createRender(canvasElement, deviceRatio, Width, Height);
        this.draw(canvasElement, Width, Height);
        // コントロール
        this.addControls();
        // 床面を生成する
        this.createHelper();
        //
        this.gui = new dat_gui_module_js_1.GUI();
        this.gui.domElement.id = 'gui_css';
        this.gui.add(this.params, 'GridHelper').onChange(function (value) {
            // guiによる設定
            _this.GridHelper.visible = value;
            _this.render();
        });
        this.gui.open();
    };
    // 床面を生成する
    SceneService.prototype.createHelper = function () {
        this.axisHelper = new THREE.AxesHelper(200);
        this.scene.add(this.axisHelper);
        this.axisHelper.visible = false;
        this.GridHelper = new THREE.GridHelper(200, 20);
        this.GridHelper.geometry.rotateX(Math.PI / 2);
        this.GridHelper.material['opacity'] = 0.2;
        this.GridHelper.material['transparent'] = true;
        this.scene.add(this.GridHelper);
    };
    // コントロール
    SceneService.prototype.addControls = function () {
        var controls = new OrbitControls_js_1.OrbitControls(this.camera, this.renderer.domElement);
        controls.damping = 0.2;
        controls.addEventListener('change', this.render);
    };
    // 物体とマウスの交差判定に用いるレイキャスト
    SceneService.prototype.getRaycaster = function (mouse) {
        var raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, this.camera);
        return raycaster;
    };
    // カメラの初期化
    SceneService.prototype.createCamera = function (aspectRatio) {
        this.camera = new THREE.PerspectiveCamera(70, aspectRatio, 0.1, 1000);
        this.camera.position.set(0, -50, 20);
        this.scene.add(this.camera);
    };
    // レンダラーを初期化する
    SceneService.prototype.createRender = function (canvasElement, 
    //context: HTMLCanvasElement,
    deviceRatio, Width, Height) {
        this.renderer = new THREE.WebGLRenderer({
            canvas: canvasElement,
            // context:context,
            alpha: true,
            antialias: true
        });
        this.renderer.setPixelRatio(deviceRatio);
        this.renderer.setSize(Width, Height);
        this.renderer.shadowMap.enabled = true;
    };
    SceneService.prototype.draw = function (a, b, c) {
        this.OnInit;
        var d = a;
        var e = b;
        var f = c;
        return { d: d, e: e, f: f };
    };
    SceneService.prototype.RendererDomElement = function () {
        return this.renderer.domElement;
    };
    // リサイズ
    SceneService.prototype.onResize = function (deviceRatio, Width, Height) {
        this.camera.aspect = deviceRatio;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(Width, Height);
        this.render();
    };
    // レンダリングする
    SceneService.prototype.render = function () {
        this.renderer.render(this.scene, this.camera);
    };
    // レンダリングのサイズを取得する
    SceneService.prototype.getBoundingClientRect = function () {
        return this.renderer.domElement.getBoundingClientRect();
    };
    // シーンにオブジェクトを追加する
    SceneService.prototype.add = function () {
        var threeObject = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            threeObject[_i] = arguments[_i];
        }
        for (var _a = 0, threeObject_1 = threeObject; _a < threeObject_1.length; _a++) {
            var obj = threeObject_1[_a];
            this.scene.add(obj);
        }
    };
    // シーンのオブジェクトを削除する
    SceneService.prototype.remove = function () {
        var threeObject = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            threeObject[_i] = arguments[_i];
        }
        for (var _a = 0, threeObject_2 = threeObject; _a < threeObject_2.length; _a++) {
            var obj = threeObject_2[_a];
            this.scene.remove(obj);
        }
    };
    // シーンにオブジェクトを削除する
    SceneService.prototype.removeByName = function () {
        var threeName = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            threeName[_i] = arguments[_i];
        }
        for (var _a = 0, threeName_1 = threeName; _a < threeName_1.length; _a++) {
            var name = threeName_1[_a];
            var target = this.scene.getObjectByName(name);
            if (target === undefined) {
                continue;
            }
            this.scene.remove(target);
        }
    };
    // ファイルに視点を保存する
    SceneService.prototype.getSettingJson = function () {
        return {
            camera: {
                x: this.camera.position.x,
                y: this.camera.position.y,
                z: this.camera.position.z
            }
        };
    };
    SceneService = __decorate([
        core_1.Injectable({
            providedIn: 'root'
        })
    ], SceneService);
    return SceneService;
}());
exports.SceneService = SceneService;
