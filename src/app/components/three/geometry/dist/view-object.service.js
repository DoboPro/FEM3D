"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.ViewObjectService = void 0;
var core_1 = require("@angular/core");
var THREE = require("three");
var ViewObjectService = /** @class */ (function () {
    function ViewObjectService(scene, mesh, model) {
        this.scene = scene;
        this.mesh = mesh;
        this.model = model;
    }
    ViewObjectService.prototype.create = function () {
        // 要素表示マテリアル
        var geometry1 = this.mesh.getGeometry();
        var elemMat = new THREE.MeshStandardMaterial({
            vertexColors: true,
            roughness: 0.2,
            metalness: 0.5,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide
        });
        var color = new THREE.Color(0x734e30); //茶色
        this.setGeomContour(geometry1, color);
        var meshMaterial = new THREE.Mesh(geometry1, elemMat);
        this.scene.add(meshMaterial);
        // 要素辺の表示マテリアル
        var geometry2 = this.mesh.getEdgeGeometry();
        var EDGE_MAT = new THREE.LineBasicMaterial({ color: 0xf5f5f5 });
        var edgeMaterial = new THREE.LineSegments(geometry2, EDGE_MAT);
        this.scene.add(edgeMaterial);
    };
    ViewObjectService.prototype.createRestraint = function () {
        // var hs=0.02*bounds.size,
        var hs = 1;
        var rests = this.model.bc.restraints;
        var restMaterial = new THREE.Group();
        for (var i = 0; i < rests.length; i++) {
            // let r=this.rest.RestraintHelper(rests[i],hs);
            // r.position.copy(this.model.mesh.nodes[rests[i].node]);
            // restMaterial.add(r);
        }
        this.scene.add(restMaterial);
    };
    ViewObjectService.prototype.setGeomContour = function (geometry, color) {
        var colors_mesh = geometry.attributes.color.array;
        var count = geometry.attributes.color.count;
        for (var i = 0; i < count; i++) {
            var i3 = 3 * i;
            colors_mesh[i3] = color.r; //r  color.r
            colors_mesh[i3 + 1] = color.g; //g  color.g
            colors_mesh[i3 + 2] = color.b; //b  color.b
        }
        geometry.attributes.color.needsUpdate = true;
    };
    ViewObjectService = __decorate([
        core_1.Injectable({
            providedIn: 'root'
        })
        // 表示オブジェクト
    ], ViewObjectService);
    return ViewObjectService;
}());
exports.ViewObjectService = ViewObjectService;
// public changeData(model: any): void {
//   //
//   console.log(model);
//   //
//   const geometry = new THREE.PlaneGeometry(5, 20, 32);
//   const material = new THREE.MeshBasicMaterial({
//     color: 0xffff00,
//     side: THREE.DoubleSide,
//   });
//   const plane = new THREE.Mesh(geometry, material);
//   plane.rotation.x = -0.5 * Math.PI;
//   plane.position.y = 3;
//   this.scene.add(plane);
//   //this.geometrys.push(plane);
//   this.scene.render();
// }
