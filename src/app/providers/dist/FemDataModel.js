"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.FemDataModel = void 0;
var core_1 = require("@angular/core");
var Material_1 = require("./material/Material");
var numeric = require("./libs/numeric-1.2.6.min.js");
var THREE = require("three");
var FemDataModel = /** @class */ (function () {
    function FemDataModel(mesh, bc, result) {
        this.mesh = mesh;
        this.bc = bc;
        this.result = result;
        this.COEF_F_W = 0.5 / Math.PI; // f/ω比 1/2π
    }
    // データを消去する
    FemDataModel.prototype.clear = function () {
        this.materials = new Array();
        this.mesh.clear(); // メッシュモデル
        this.bc.clear(); // 境界条件
        this.result.clear(); // 計算結果
    };
    // モデルを初期化する（各パラメータに分類したデータを計算するのに違う定数に代入、並び替え、初期化の残り等を行う。）
    FemDataModel.prototype.init = function () {
        // 材料特性の代入(材料番号、ヤング率、、など)
        var mats = this.materials;
        // 材料特性を材料番号が小さい順に並び替える（片持ち梁データの場合は材料が1種類なので不要な処理）
        mats.sort(this.compareLabel);
        // 材料特性が2種類以上ある場合に、節点を小さい番号順に並び替える      
        this.mesh.nodes.sort(this.compareLabel);
        // 境界条件について、初期化、荷重の最大値の探索、小さい順に並び替えをしている。
        this.bc.init();
        // ラベルを再設定する（節点番号1をプログラミング用に0にするなど）             
        this.reNumbering();
        this.resetMaterialLabel();
        // 要素を鏡像反転させるか（パソコンのメモリ節約のため）
        this.mesh.checkChirality();
        // コンター図表示のために表面がどこかを取得する
        this.mesh.getFreeFaces();
        // 要素の境界線を引く
        this.mesh.getFaceEdges();
        // ☆Dマトリクス（材料の特性を示すマトリクス）の作成
        for (var i = 0; i < mats.length; i++) {
            var m3d = mats[i].matrix3D();
            mats[i].matrix = { m3d: m3d };
        }
    };
    // ラベルを比較する
    // o1,o2 - 比較する対象
    FemDataModel.prototype.compareLabel = function (o1, o2) {
        if (o1.label < o2.label) {
            return -1;
        }
        else if (o1.label > o2.label) {
            return 1;
        }
        else {
            return 0;
        }
    };
    // 節点・要素ポインタを設定する
    FemDataModel.prototype.reNumbering = function () {
        var nodes = this.mesh.nodes;
        var elements = this.mesh.elements;
        var map = [];
        for (var i = 0; i < nodes.length; i++) {
            map[nodes[i].label] = i;
        }
        for (var i = 0; i < elements.length; i++) {
            this.resetNodes(map, elements[i]);
        }
        for (var i = 0; i < this.bc.restraints.length; i++) {
            this.resetNodePointer(map, this.bc.restraints[i]);
        }
        for (var i = 0; i < this.bc.loads.length; i++) {
            this.resetNodePointer(map, this.bc.loads[i]);
        }
        map.length = 0;
        for (var i = 0; i < elements.length; i++) {
            map[elements[i].label] = i;
        }
    };
    // 材料ポインタを設定する
    FemDataModel.prototype.resetMaterialLabel = function () {
        if (this.materials.length === 0) {
            this.materials.push(new Material_1.Material(1, 1, 0.3, 1, 1, 1));
        }
        var map = [];
        var elements = this.mesh.elements;
        for (var i = 0; i < this.materials.length; i++) {
            map[this.materials[i].label] = i;
        }
        for (var i = 0; i < elements.length; i++) {
            if (elements[i].material in map) {
                elements[i].material = map[elements[i].material];
            }
            else {
                throw new Error('材料番号' + elements[i].material + 'は存在しません');
            }
        }
    };
    // 節点集合の節点ラベルを再設定する
    // map - ラベルマップ
    // s - 節点集合
    FemDataModel.prototype.resetNodes = function (map, s) {
        for (var i = 0; i < s.nodes.length; i++) {
            if (s.nodes[i] in map) {
                s.nodes[i] = map[s.nodes[i]];
            }
            else {
                throw new Error('節点番号' + s.nodes[i] + 'は存在しません');
            }
        }
    };
    // 節点ポインタを再設定する
    // map - ラベルマップ
    // bc - 境界条件
    FemDataModel.prototype.resetNodePointer = function (map, bc) {
        if (bc.node in map) {
            bc.node = map[bc.node];
        }
        else {
            throw new Error('節点番号' + bc.node + 'は存在しません');
        }
    };
    // 要素ポインタを再設定する
    // map - ラベルマップ
    // bc - 境界条件
    FemDataModel.prototype.resetElementPointer = function (map, bc) {
        if (bc.element in map) {
            bc.element = map[bc.element];
        }
        else {
            throw new Error('要素番号' + bc.element + 'は存在しません');
        }
    };
    // ☆　節点の自由度を設定する（今回は回転拘束を考慮しないので自由度３になる）
    FemDataModel.prototype.setNodeDoF = function () {
        var dof = this.bc.dof;
        var nodeCount = this.mesh.nodes.length;
        dof.length = 0;
        for (var i = 0; i < nodeCount; i++) {
            dof[i] = 3;
        }
        //節点の数だけ自由度3を代入してあるので、dofAllという全節点分の自由度の合計を返してくる。
        return this.bc.setPointerStructure(nodeCount); // =dofAll
    };
    // 要素歪・応力・歪エネルギー密度を計算する
    FemDataModel.prototype.calculateElementStress = function () {
        var nodes = this.mesh.nodes;
        var elems = this.mesh.elements;
        var elemCount = elems.length;
        this.result.initStrainAndStress(elemCount);
        for (var i = 0; i < elemCount; i++) {
            var elem = elems[i], en = elem.nodes;
            var p = new Array();
            var v = new Array();
            for (var j = 0; j < en.length; j++) {
                p[j] = nodes[en[j]];
                v[j] = this.result.displacement[en[j]];
            }
            var material = this.materials[elem.material], mat = material.matrix;
            var s = elem.elementStrainStress(p, v, mat.m3d);
            this.result.addStructureData(i, s[0], s[1], s[2], s[0], s[1], s[2]);
        }
    };
    // 節点歪・応力・歪エネルギー密度を計算する
    FemDataModel.prototype.calculateNodeStress = function () {
        var nodes = this.mesh.nodes;
        var nodeCount = nodes.length;
        var elems = this.mesh.elements;
        var elemCount = elems.length;
        var angle = numeric.rep([nodeCount], 0);
        this.result.initStrainAndStress(nodeCount);
        for (var i = 0; i < elemCount; i++) {
            var elem = elems[i];
            var en = elem.nodes;
            var p = new Array();
            var v = new Array();
            for (var j = 0; j < en.length; j++) {
                p[j] = nodes[en[j]];
                v[j] = this.result.displacement[en[j]];
            }
            var material = this.materials[elem.material];
            var mat = material.matrix;
            var ea = elem.angle(p, elem.nodeCount());
            var s = elem.strainStress(p, v, mat.m3d);
            var eps1 = s[0];
            var str1 = s[1];
            var se1 = s[2];
            for (var j = 0; j < en.length; j++) {
                var eaj = ea[j];
                eps1[j].mul(eaj);
                str1[j].mul(eaj);
                se1[j] *= eaj;
                this.result.addStructureData(en[j], eps1[j], str1[j], se1[j], eps1[j], str1[j], se1[j]);
                angle[en[j]] += eaj;
            }
        }
        for (var i = 0; i < nodeCount; i++) {
            if (angle[i] !== 0) {
                this.result.mulStructureData(i, 1 / angle[i]);
            }
        }
    };
    FemDataModel.prototype.removeObject = function (obj) {
        var scene = new THREE.Scene(); // シーン
        scene.remove(obj);
    };
    ;
    FemDataModel = __decorate([
        core_1.Injectable({
            providedIn: 'root'
        })
    ], FemDataModel);
    return FemDataModel;
}());
exports.FemDataModel = FemDataModel;
