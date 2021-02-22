"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.Solver = void 0;
var core_1 = require("@angular/core");
var numeric = require("./libs/numeric-1.2.6.min.js");
var Solver = /** @class */ (function () {
    function Solver(model, view, result) {
        this.model = model;
        this.view = view;
        this.result = result;
        this.PRECISION = 1e-10; // マトリックス精度
        this.LU_METHOD = 0; // LU分解法
        this.ILUCG_METHOD = 1; // 不完全LU分解共役勾配法
        this.clear();
        this.method = this.LU_METHOD;
    }
    // データを消去する
    Solver.prototype.clear = function () {
        this.matrix = new Array();
        this.matrix2 = new Array();
        this.vector = new Array();
        this.dof = 0;
    };
    // 計算を開始する
    Solver.prototype.calcStart = function () {
        try {
            var t0 = new Date().getTime();
            var calc = false;
            if (this.model.bc.restraints.length > 0) {
                this.dof = this.model.setNodeDoF();
                this.createStiffnessMatrix();
                this.d = this.solve();
                this.result.setDisplacement(this.model.bc, this.d, this.model.mesh.nodes.length);
                if (this.result.type === this.result.ELEMENT_DATA) {
                    this.model.calculateElementStress();
                }
                else {
                    this.model.calculateNodeStress();
                }
                calc = true;
            }
            if (!calc) {
                alert('拘束条件不足のため計算できません');
            }
            var t1 = new Date().getTime();
            var disp = this.result.displacement;
            this.view.setDisplacement(disp);
            //  this.result.setConfig(disp,"6","0");
            // 変位とmagという情報を送る
            console.log('Calculation time:' + (t1 - t0) + 'ms');
        }
        catch (ex) {
            alert(ex);
        }
    };
    // public contStart(){
    //   this.result.setConfig(0,"0","6");
    // }
    // 剛性マトリックス・荷重ベクトルを作成する
    Solver.prototype.createStiffnessMatrix = function () {
        var bc = this.model.bc;
        var bcList = bc.bcList;
        var reducedList = new Array();
        for (var i = 0; i < bcList.length; i++) {
            if (bcList[i] < 0) {
                reducedList.push(i);
            }
        }
        // 剛性マトリックス・荷重ベクトルの作成
        var matrix1 = this.stiffnessMatrix(this.dof);
        var vector1 = this.loadVector(this.dof);
        // 拘束自由度を除去する
        for (var i = 0; i < bcList.length; i++) {
            if (bcList[i] >= 0) {
                var rx = bc.getRestDisp(bcList[i]);
                for (var j = 0; j < vector1.length; j++) {
                    if (i in matrix1[j]) {
                        vector1[j] -= rx * matrix1[j][i];
                    }
                }
            }
        }
        this.extruct(matrix1, vector1, reducedList);
    };
    // 剛性マトリックスを作成する
    // dof - モデル自由度
    Solver.prototype.stiffnessMatrix = function (dof) {
        var mesh = this.model.mesh;
        var elements = mesh.elements;
        var matrix = [];
        var km;
        var kmax = 0;
        for (var i = 0; i < dof; i++)
            matrix[i] = [];
        for (var i = 0; i < elements.length; i++) {
            var elem = elements[i];
            var material = this.model.materials[elem.material];
            var mat = material.matrix;
            if (elem.isShell) {
                var sp = this.model.shellParams[elem.param];
                if (elem.getName() === 'TriElement1') {
                    km = elem.stiffnessMatrix(mesh.getNodes(elem), mat.m2d, sp);
                }
                else {
                    km = elem.stiffnessMatrix(mesh.getNodes(elem), mat.msh, sp);
                }
                kmax = this.setElementMatrix(elem, 6, matrix, km, kmax);
            }
            //else if (elem.isBar) {
            //  const sect = this.model.barParams[elem.param].section;
            //  km = elem.stiffnessMatrix(mesh.getNodes(elem), material, sect);
            //  kmax = this.setElementMatrix(elem, 6, matrix, km, kmax);
            //}
            else {
                km = elem.stiffnessMatrix(mesh.getNodes(elem), mat.m3d);
                kmax = this.setElementMatrix(elem, 3, matrix, km, kmax);
            }
        }
        // 座標変換
        var rests = this.model.bc.restraints;
        var index = this.model.bc.nodeIndex;
        var bcdof = this.model.bc.dof;
        for (var i = 0; i < rests.length; i++) {
            var ri = rests[i];
            if (ri.coords) {
                ri.coords.transMatrix(matrix, dof, index[ri.node], bcdof[i]);
            }
        }
        // 絶対値が小さい成分を除去する
        var eps = this.PRECISION * kmax;
        for (var i = 0; i < dof; i++) {
            var mrow = matrix[i];
            for (var _i = 0, mrow_1 = mrow; _i < mrow_1.length; _i++) {
                var j = mrow_1[_i];
                if (mrow.hasOwnProperty(j)) {
                    j = parseInt(j);
                    if (Math.abs(mrow[j]) < eps) {
                        delete mrow[j];
                    }
                }
            }
        }
        return matrix;
    };
    // 要素のマトリックスを設定する
    // element - 要素
    // dof - 自由度
    // matrix - 全体剛性マトリックス
    // km - 要素の剛性マトリックス
    // kmax - 成分の絶対値の最大値
    Solver.prototype.setElementMatrix = function (element, dof, matrix, km, kmax) {
        var nodeCount = element.nodeCount();
        var index = this.model.bc.nodeIndex;
        var nodes = element.nodes;
        for (var i = 0; i < nodeCount; i++) {
            var row0 = index[nodes[i]];
            var i0 = dof * i;
            for (var j = 0; j < nodeCount; j++) {
                var column0 = index[nodes[j]];
                var j0 = dof * j;
                for (var i1 = 0; i1 < dof; i1++) {
                    var mrow = matrix[row0 + i1];
                    var krow = km[i0 + i1];
                    for (var j1 = 0; j1 < dof; j1++) {
                        var cj1 = column0 + j1;
                        if (cj1 in mrow) {
                            mrow[cj1] += krow[j0 + j1];
                            kmax = Math.max(kmax, Math.abs(mrow[cj1]));
                        }
                        else {
                            mrow[cj1] = krow[j0 + j1];
                            kmax = Math.max(kmax, Math.abs(mrow[cj1]));
                        }
                    }
                }
            }
        }
        return kmax;
    };
    // 連立方程式を解く
    Solver.prototype.solve = function () {
        var a = numeric.ccsSparse(this.matrix);
        return numeric.ccsLUPSolve(numeric.ccsLUP(a), this.vector);
    };
    // 荷重ベクトルを作成する
    // dof - モデル自由度
    Solver.prototype.loadVector = function (dof) {
        var loads = this.model.bc.loads;
        // const press = this.model.bc.pressures;
        var vector = numeric.rep([dof], 0);
        var index = this.model.bc.nodeIndex;
        var bcdof = this.model.bc.dof;
        for (var i = 0; i < loads.length; i++) {
            var ld = loads[i];
            var nd = ld.node;
            var ldx = ld.globalX;
            var ldof = bcdof[nd];
            var index0 = index[nd];
            for (var j = 0; j < ldof; j++) {
                vector[index0 + j] = ldx[j];
            }
        }
        var rests = this.model.bc.restraints;
        for (var i = 0; i < rests.length; i++) {
            var ri = rests[i];
            if (ri.coords) {
                ri.coords.transVector(vector, dof, index[ri.node], bcdof[i]);
            }
        }
        return vector;
    };
    // 行列の一部を抽出する
    // matrix1,vector1 - 元のマトリックス,ベクトル
    // list - 抽出部分のリスト
    Solver.prototype.extruct = function (matrix1, vector1, list) {
        this.matrix.length = 0;
        this.vector.length = 0;
        for (var i = 0; i < list.length; i++) {
            this.vector[i] = vector1[list[i]];
            this.matrix[i] = this.extructRow(matrix1[list[i]], list);
        }
    };
    // 行列の行から一部を抽出する
    // mrow - 元のマトリックスの行データ
    // list - 抽出部分のリスト
    Solver.prototype.extructRow = function (mrow, list) {
        var exrow = [];
        var col = [];
        var i1 = 0;
        var j1 = 0;
        for (var j in mrow) {
            if (mrow.hasOwnProperty(j)) {
                col.push(parseInt(j));
            }
        }
        col.sort(function (j1, j2) {
            return j1 - j2;
        });
        while (i1 < col.length && j1 < list.length) {
            if (col[i1] == list[j1]) {
                exrow[j1] = mrow[col[i1]];
                i1++;
                j1++;
            }
            else if (col[i1] < list[j1]) {
                i1++;
            }
            else {
                j1++;
            }
        }
        return exrow;
    };
    Solver = __decorate([
        core_1.Injectable({
            providedIn: 'root'
        })
        // 連立方程式求解オブジェクト
    ], Solver);
    return Solver;
}());
exports.Solver = Solver;
