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
var View = /** @class */ (function () {
    function View(model, mesh, scene, result) {
        this.model = model;
        this.mesh = mesh;
        this.scene = scene;
        this.result = result;
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
        var coef = 0.1;
        var label = geometry_mesh.nodes, nodes = this.model.mesh.nodes, angle = geometry_mesh.angle;
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
        var coef = 0.1;
        var label = geometry_edge.nodes, nodes = this.model.mesh.nodes, angle = geometry_edge.angle;
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
    View.prototype.setContour = function (disp, minValue, maxValue) {
        var coef = 1;
        if (maxValue !== minValue)
            coef = 1 / (maxValue - minValue);
        // setGeomContour(this.mesh.geometry,value,minValue,coef,type);
        // this.bar.setContour(value,minValue,coef,type);
    };
    ;
    View = __decorate([
        core_1.Injectable({
            providedIn: 'root'
        })
        // 連立方程式求解オブジェクト
    ], View);
    return View;
}());
exports.View = View;
