"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.SolidElement = void 0;
var core_1 = require("@angular/core");
var THREE = require("three");
var numeric = require("../libs/numeric-1.2.6.min.js");
var FElement_1 = require("./FElement");
var Strain_1 = require("../stress/Strain");
var Stress_1 = require("../stress/Stress");
var SolidElement = /** @class */ (function (_super) {
    __extends(SolidElement, _super);
    function SolidElement(label, material, nodes, nodeP, intP) {
        var _this = _super.call(this, label, material, nodes) || this;
        _this.nodeP = nodeP;
        _this.intP = intP;
        _this.isShell = false;
        _this.nodeP = nodeP;
        _this.intP = intP;
        return _this;
    }
    // ヤコビ行列を返す
    // p - 要素節点
    // sf - 形状関数行列
    SolidElement.prototype.jacobianMatrix = function (p, sf) {
        var jac = [0, 0, 0, 0, 0, 0, 0, 0, 0];
        for (var i = 0; i < this.count; i++) {
            var sfi = sf[i];
            var pix = p[i].x;
            var piy = p[i].y;
            var piz = p[i].z;
            for (var j = 0; j < 3; j++) {
                var sfij = sfi[j + 1];
                jac[j] += sfij * pix;
                jac[j + 3] += sfij * piy;
                jac[j + 6] += sfij * piz;
            }
        }
        return new THREE.Matrix3().fromArray(jac);
    };
    // 形状関数の勾配 [ dNi/dx dNi/dy dNi/dz ] を返す
    // p - 要素節点
    // ja - ヤコビ行列
    // sf - 形状関数行列
    SolidElement.prototype.grad = function (p, ja, sf) {
        var gr = [];
        var ji = new THREE.Matrix3().getInverse(ja, true).elements;
        for (var i = 0; i < this.count; i++) {
            gr[i] = [ji[0] * sf[i][1] + ji[3] * sf[i][2] + ji[6] * sf[i][3],
                ji[1] * sf[i][1] + ji[4] * sf[i][2] + ji[7] * sf[i][3],
                ji[2] * sf[i][1] + ji[5] * sf[i][2] + ji[8] * sf[i][3]];
        }
        return gr;
    };
    ;
    // 歪 - 変位マトリクスの転置行列を返す
    // grad - 形状関数の勾配
    SolidElement.prototype.strainMatrix = function (grad) {
        var m = numeric.rep([3 * this.count, 6], 0);
        for (var i = 0; i < this.count; i++) {
            var i3 = 3 * i, gr = grad[i];
            m[i3][0] = gr[0];
            m[i3 + 1][1] = gr[1];
            m[i3 + 2][2] = gr[2];
            m[i3][3] = gr[1];
            m[i3 + 1][3] = gr[0];
            m[i3 + 1][4] = gr[2];
            m[i3 + 2][4] = gr[1];
            m[i3][5] = gr[2];
            m[i3 + 2][5] = gr[0];
        }
        return m;
    };
    ;
    // 積分点の形状関数マトリクス [ NiNj ] を返す
    // p - 要素節点
    // x - ξ,η,ζ座標
    // w - 重み係数
    SolidElement.prototype.shapePart = function (p, x, w) {
        var sf = this.shapeFunction(x[0], x[1], x[2]);
        var ja = this.jacobianMatrix(p, sf);
        var matrix = [];
        var coef = w * Math.abs(ja.determinant());
        for (var i = 0; i < this.count; i++) {
            var matr = [], cf2 = coef * sf[i][0];
            for (var j = 0; j < this.count; j++) {
                matr[j] = cf2 * sf[j][0];
            }
            matrix[i] = matr;
        }
        return matrix;
    };
    ;
    // 積分点の拡散マトリクス [ ∇Ni・∇Nj ] を返す
    // p - 要素節点
    // x - ξ,η,ζ座標
    // w - 重み係数
    SolidElement.prototype.gradPart = function (p, x, w) {
        var sf = this.shapeFunction(x[0], x[1], x[2]);
        var ja = this.jacobianMatrix(p, sf);
        var gr = this.grad(p, ja, sf);
        var matrix = [];
        var coef = w * Math.abs(ja.determinant());
        for (var i = 0; i < this.count; i++) {
            var matr = [], gri = gr[i];
            var c1 = coef * gri[0], c2 = coef * gri[1], c3 = coef * gri[2];
            for (var j = 0; j < this.count; j++) {
                var grj = gr[j];
                matr[j] = c1 * grj[0] + c2 * grj[1] + c3 * grj[2];
            }
            matrix[i] = matr;
        }
        return matrix;
    };
    ;
    // 質量マトリクスを返す
    // p - 要素節点
    // dens - 材料の密度
    SolidElement.prototype.massMatrix = function (p, dens) {
        var m = numeric.rep([3 * this.count, 3 * this.count], 0);
        for (var i = 0; i < this.intP.length; i++) {
            var sf = this.shapeFunction(this.intP[i][0], this.intP[i][1], this.intP[i][2]);
            var ja = this.jacobianMatrix(p, sf);
            var coef = this.intP[i][3] * dens * Math.abs(ja.determinant());
            for (var i1 = 0; i1 < this.count; i1++) {
                for (var j1 = 0; j1 < this.count; j1++) {
                    var value = coef * sf[i1][0] * sf[j1][0], i3 = 3 * i1, j3 = 3 * j1;
                    m[i3][j3] += value;
                    m[i3 + 1][j3 + 1] += value;
                    m[i3 + 2][j3 + 2] += value;
                }
            }
        }
        return m;
    };
    ;
    // 剛性マトリクスを返す
    // p - 要素節点
    // d1 - 応力 - 歪マトリクス
    SolidElement.prototype.stiffnessMatrix = function (p, d1) {
        var count = 3 * this.count;
        var kk = numeric.rep([count, count], 0);
        for (var i = 0; i < this.intP.length; i++) {
            var ip = this.intP[i];
            var sf = this.shapeFunction(ip[0], ip[1], ip[2]);
            var ja = this.jacobianMatrix(p, sf);
            var ks = this.stiffPart(d1, this.strainMatrix(this.grad(p, ja, sf)), ip[3] * Math.abs(ja.determinant()));
            this.addMatrix(kk, ks);
        }
        return kk;
    };
    ;
    // 形状関数マトリクス [ ∫NiNjdV ] を返す
    // p - 要素節点
    // coef - 係数
    SolidElement.prototype.shapeFunctionMatrix = function (p, coef) {
        var s = numeric.rep([this.count, this.count], 0);
        for (var i = 0; i < this.intP.length; i++) {
            this.addMatrix(s, this.shapePart(p, this.intP[i], coef * this.intP[i][3]));
        }
        return s;
    };
    ;
    // 拡散マトリクス [ ∫∇Ni・∇NjdV ] を返す
    // p - 要素節点
    // coef - 係数
    SolidElement.prototype.gradMatrix = function (p, coef) {
        var g = numeric.rep([this.count, this.count], 0);
        for (var i = 0; i < this.intP.length; i++) {
            this.addMatrix(g, this.gradPart(p, this.intP[i], coef * this.intP[i][3]));
        }
        return g;
    };
    ;
    // 幾何剛性マトリクスを返す
    // p - 要素節点
    // u - 節点変位
    // d1 - 応力 - 歪マトリクス
    SolidElement.prototype.geomStiffnessMatrix = function (p, u, d1) {
        var kk = numeric.rep([3 * this.count, 3 * this.count], 0);
        var v = this.toArray(u, 3, this.count);
        for (var i = 0; i < this.intP.length; i++) {
            var ip = this.intP[i];
            var sf = this.shapeFunction(ip[0], ip[1], ip[2]);
            var ja = this.jacobianMatrix(p, sf);
            var gr = this.grad(p, ja, sf);
            var sm = this.strainMatrix(gr);
            var str = numeric.dotMV(d1, numeric.dotVM(v, sm));
            var w = ip[3] * Math.abs(ja.determinant());
            for (var i1 = 0; i1 < this.count; i1++) {
                var i3 = 3 * i1, gri = gr[i1];
                for (var j1 = 0; j1 < this.count; j1++) {
                    var j3 = 3 * j1, grj = gr[j1];
                    var s = w * (gri[0] * (str[0] * grj[0] + str[3] * grj[1] + str[5] * grj[2]) +
                        gri[1] * (str[3] * grj[0] + str[1] * grj[1] + str[4] * grj[2]) +
                        gri[2] * (str[5] * grj[0] + str[4] * grj[1] + str[2] * grj[2]));
                    kk[i3][j3] += s;
                    kk[i3 + 1][j3 + 1] += s;
                    kk[i3 + 2][j3 + 2] += s;
                }
            }
        }
        return kk;
    };
    ;
    // 節点歪・応力を返す
    // p - 要素節点
    // u - 節点変位
    // d1 - 応力 - 歪マトリクス
    SolidElement.prototype.strainStress = function (p, u, d1) {
        var v = this.toArray(u, 3, this.count);
        var strain = [], stress = [], energy = [];
        for (var i = 0; i < this.count; i++) {
            var eps = this.strainPart(p, v, this.nodeP[i]);
            strain[i] = new Strain_1.Strain(eps);
            var str = numeric.dotMV(d1, eps);
            stress[i] = new Stress_1.Stress(str);
            energy[i] = 0.5 * strain[i].innerProduct(stress[i]);
        }
        return [strain, stress, energy];
    };
    ;
    // 要素内の歪ベクトルを返す
    // p - 要素節点
    // v - 節点変位ベクトル
    // x - ξ,η,ζ座標
    SolidElement.prototype.strainPart = function (p, v, x) {
        var sf = this.shapeFunction(x[0], x[1], x[2]);
        var ja = this.jacobianMatrix(p, sf);
        var sm = this.strainMatrix(this.grad(p, ja, sf));
        return numeric.dotVM(v, sm);
    };
    ;
    // 節点数を返す
    SolidElement.prototype.nodeCount = function () {
        return 8;
    };
    SolidElement = __decorate([
        core_1.Injectable({
            providedIn: 'root'
        })
        //--------------------------------------------------------------------//
        // ソリッド要素
        // label - 要素ラベル
        // material - 材料のインデックス
        // nodes - 節点番号
        // nodeP - 節点のξ,η,ζ座標
        // intP - 積分点のξ,η,ζ座標,重み係数
    ], SolidElement);
    return SolidElement;
}(FElement_1.FElement));
exports.SolidElement = SolidElement;
