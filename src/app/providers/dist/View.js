"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.View = void 0;
var core_1 = require("@angular/core");
// import { SceneService } from '../components/three/scene.service';
var View = /** @class */ (function () {
    function View(model, mesh, 
    // private scene: SceneService,
    // private result: Result
    bounds) {
        this.model = model;
        this.mesh = mesh;
        this.bounds = bounds;
        this.PRECISION = 1e-10; // マトリックス精度
        this.LU_METHOD = 0; // LU分解法
        this.ILUCG_METHOD = 1; // 不完全LU分解共役勾配法
    }
    View.prototype.setDisplacement = function (disp) {
        if (disp.length === 0)
            return;
        this.setGeomDisplacement1(this.mesh.geometry_mesh, disp);
        this.setGeomDisplacement2(this.mesh.geometry_edge, disp);
    };
    View.prototype.setGeomDisplacement1 = function (geometry_mesh, disp) {
        var bc = this.model.bc;
        // ベクトル最小長さ
        var MIN_VECTOR = 1e-8; // ベクトル長さの最小値
        var coef = (0.1 * this.bounds.size) / Math.max(bc.loadMax, MIN_VECTOR);
        var label = geometry_mesh.nodes, nodes = this.mesh.nodes, angle = geometry_mesh.angle;
        var pos = geometry_mesh.attributes.position.array;
        for (var i = 0; i < label.length; i++) {
            var i3 = 3 * i, p = nodes[label[i]], dx = disp[label[i]].x;
            console.log(pos[i3]);
            pos[i3] = p.x + coef * dx[0];
            pos[i3 + 1] = p.y + coef * dx[1];
            pos[i3 + 2] = p.z + coef * dx[2];
            angle[i3] = coef * dx[3];
            angle[i3 + 1] = coef * dx[4];
            angle[i3 + 2] = coef * dx[5];
        }
        geometry_mesh.attributes.position.needsUpdate = true;
    };
    View.prototype.setGeomDisplacement2 = function (geometry_edge, disp) {
        var bc = this.model.bc;
        // ベクトル最小長さ
        var MIN_VECTOR = 1e-8; // ベクトル長さの最小値
        var coef = (0.1 * this.bounds.size) / Math.max(bc.loadMax, MIN_VECTOR);
        var label = geometry_edge.nodes, nodes = this.mesh.nodes, angle = geometry_edge.angle;
        var pos = geometry_edge.attributes.position.array;
        for (var i = 0; i < label.length; i++) {
            var i3 = 3 * i, p = nodes[label[i]], dx = disp[label[i]].x;
            pos[i3] = p.x + coef * dx[0];
            pos[i3 + 1] = p.y + coef * dx[1];
            pos[i3 + 2] = p.z + coef * dx[2];
            angle[i3] = coef * dx[3];
            angle[i3 + 1] = coef * dx[4];
            angle[i3 + 2] = coef * dx[5];
        }
        geometry_edge.attributes.position.needsUpdate = true;
    };
    View.prototype.setContour = function (value, minValue, maxValue) {
        var coef = 1;
        if (maxValue !== minValue)
            coef = 1 / (maxValue - minValue);
        this.setGeomContour(this.mesh.geometry_mesh, value, minValue, coef);
        // this.bar.setContour(value,minValue,coef,type);
    };
    // 形状データのコンター図を設定する
    // geometry - 対象となる形状データ
    // value - コンター図データ
    // minValue - コンター図データ最小値
    // coef - データ変換係数
    // type - データ保持形態
    View.prototype.setGeomContour = function (geometry_mesh, value, minValue, coef) {
        var colors_mesh = geometry_mesh.attributes.color.array;
        var label_mesh = geometry_mesh.nodes;
        for (var i = 0; i < label_mesh.length; i++) {
            var i3 = 3 * i;
            var d0 = value[label_mesh[i]] - minValue;
            var d1 = coef * d0;
            this.cls1 = this.contourColor_mesh(d1);
            colors_mesh[i3] = this.cls1[0];
            colors_mesh[i3 + 1] = this.cls1[1];
            colors_mesh[i3 + 2] = this.cls1[2];
        }
        geometry_mesh.attributes.color.needsUpdate = true;
    };
    // コンター図の色を返す
    // z - 0～1の値
    View.prototype.contourColor_mesh = function (z) {
        var cls = [0, 0, 0];
        cls[0] = 0;
        cls[1] = 0;
        cls[2] = 0;
        if (z <= 0) {
            cls[2] = 1;
        }
        else if (z < 0.25) {
            cls[1] = 4 * z;
            cls[2] = 1;
        }
        else if (z < 0.5) {
            cls[1] = 1.2 - 0.8 * z;
            cls[2] = 2 - 4 * z;
        }
        else if (z < 0.75) {
            cls[0] = 4 * z - 2;
            cls[1] = 0.4 + 0.8 * z;
        }
        else if (z < 1) {
            cls[0] = 1;
            cls[1] = 4 - 4 * z;
        }
        else {
            cls[0] = 1;
        }
        return cls;
    };
    View = __decorate([
        core_1.Injectable({
            providedIn: 'root'
        })
        // 連立方程式求解オブジェクト
    ], View);
    return View;
}());
exports.View = View;
