"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.Result = void 0;
var core_1 = require("@angular/core");
var Strain_1 = require("./stress/Strain");
var Stress_1 = require("./stress/Stress");
var Vector3R_1 = require("./load_restaint/Vector3R");
// import { ColorBar } from './ColorBar';
var Result = /** @class */ (function () {
    function Result(view) {
        this.view = view;
        // データ型
        this.NONE = -1; // 空データ
        this.DISPLACEMENT = 0; // 変位
        this.STRAIN = 1; // 歪
        this.STRESS = 2; // 応力
        this.S_ENERGY = 3; // 歪エネルギー密度
        this.TEMPERATURE = 4; // 温度
        // 成分
        this.X = 0; // x成分
        this.Y = 1; // y成分
        this.Z = 2; // z成分
        this.RX = 3; // x軸回転成分
        this.RY = 4; // y軸回転成分
        this.RZ = 5; // z軸回転成分
        this.XY = 3; // xyせん断成分
        this.YZ = 4; // yzせん断成分
        this.ZX = 5; // zxせん断成分
        this.MAGNITUDE = 6; // 大きさ
        this.MAX_PRINCIPAL = 7; // 最大主成分
        this.MIN_PRINCIPAL = 8; // 最小主成分
        this.MID_PRINCIPAL = 9; // 中間主成分
        this.MAX_SHARE = 10; // 最大せん断成分
        this.VON_MISES = 11; // ミーゼス応力
        this.SHIFT = 12; // 成分シフト量
        // 変位の成分
        this.DISP_COMPONENT = ['Mag.', 'x', 'y', 'z'];
        this.DISP2_COMPONENT = ['Mag.', 'x', 'y', 'z', 'rotx', 'roty', 'rotz'];
        // 歪の成分
        this.STRAIN_COMPONENT = [
            'Max.prin.',
            'Min.prin.',
            'Mid.prin.',
            'Max.share',
            'x',
            'y',
            'z',
            'xy',
            'yz',
            'zx',
        ];
        // 応力の成分
        this.STRESS_COMPONENT = [
            'Max.prin.',
            'Min.prin.',
            'Mid.prin.',
            'Max.share',
            'Von mises',
            'x',
            'y',
            'z',
            'xy',
            'yz',
            'zx',
        ];
        // 歪エネルギー密度の成分
        this.ENERGY_COMPONENT = ['Energy'];
        this.COMP_MAP = {
            'Mag.': this.MAGNITUDE,
            x: this.X,
            y: this.Y,
            z: this.Z,
            rotx: this.RX,
            roty: this.RY,
            rotz: this.RZ,
            xy: this.XY,
            yz: this.YZ,
            zx: this.ZX,
            'Max.prin.': this.MAX_PRINCIPAL,
            'Min.prin.': this.MIN_PRINCIPAL,
            'Mid.prin.': this.MID_PRINCIPAL,
            'Max.share': this.MAX_SHARE,
            'Von mises': this.VON_MISES,
            Energy: 0,
            'x 1': this.X,
            'y 1': this.Y,
            'z 1': this.Z,
            'xy 1': this.XY,
            'yz 1': this.YZ,
            'zx 1': this.ZX,
            'Max.prin. 1': this.MAX_PRINCIPAL,
            'Min.prin. 1': this.MIN_PRINCIPAL,
            'Mid.prin. 1': this.MID_PRINCIPAL,
            'Max.share 1': this.MAX_SHARE,
            'Von mises 1': this.VON_MISES,
            'Energy 1': 0,
            'x 2': this.X + this.SHIFT,
            'y 2': this.Y + this.SHIFT,
            'z 2': this.Z + this.SHIFT,
            'xy 2': this.XY + this.SHIFT,
            'yz 2': this.YZ + this.SHIFT,
            'zx 2': this.ZX + this.SHIFT,
            'Max.prin. 2': this.MAX_PRINCIPAL + this.SHIFT,
            'Min.prin. 2': this.MIN_PRINCIPAL + this.SHIFT,
            'Mid.prin. 2': this.MID_PRINCIPAL + this.SHIFT,
            'Max.share 2': this.MAX_SHARE + this.SHIFT,
            'Von mises 2': this.VON_MISES + this.SHIFT,
            'Energy 2': 1
        };
        this.EIG_EPS = 1e-10; // 固有値計算の収束閾値
        this.NODE_DATA = 0; // 節点データ
        this.ELEMENT_DATA = 1; // 要素データ
        this.VIBRATION = 'Vibration'; // 振動解析
        this.BUCKLING = 'Buckling'; // 座屈解析
        // カンタ―
        this.contour = "6";
        this.component = "0";
    }
    // 計算結果を消去する
    Result.prototype.clear = function () {
        this.displacement = new Array(); // 変位
        this.strain1 = new Array();
        this.strain2 = new Array();
        this.stress1 = new Array();
        this.stress2 = new Array();
        this.sEnergy1 = new Array();
        this.sEnergy2 = new Array();
        this.temperature = new Array();
        this.dispMax = 0;
        this.angleMax = 0;
        this.tempMax = 0;
        this.eigenValue = new Array();
        this.calculated = false;
        this.value = new Array();
        this.minValue = 0;
        this.maxValue = 0;
        this.type = this.NODE_DATA;
    };
    // 節点歪・応力を初期化する
    // count - 節点数
    Result.prototype.initStrainAndStress = function (count) {
        this.strain1.length = 0;
        this.strain2.length = 0;
        this.stress1.length = 0;
        this.stress2.length = 0;
        this.sEnergy1.length = 0;
        this.sEnergy2.length = 0;
        var zeros = [0, 0, 0, 0, 0, 0];
        for (var i = 0; i < count; i++) {
            this.strain1[i] = new Strain_1.Strain(zeros);
            this.strain2[i] = new Strain_1.Strain(zeros);
            this.stress1[i] = new Stress_1.Stress(zeros);
            this.stress2[i] = new Stress_1.Stress(zeros);
            this.sEnergy1[i] = 0;
            this.sEnergy2[i] = 0;
        }
    };
    // 節点変位を設定する
    // bc - 境界条件
    // disp - 節点変位を表すベクトル
    // nodeCount - 節点数
    Result.prototype.setDisplacement = function (bc, disp, nodeCount) {
        this.displacement.length = 0;
        this.dispMax = 0;
        this.angleMax = 0;
        var rests = bc.restraints;
        var ii = 0;
        for (var i = 0; i < nodeCount; i++) {
            var v = new Vector3R_1.Vector3R(0, 0, 0, 0, 0, 0);
            var i0 = bc.nodeIndex[i];
            var bcDof = bc.dof[i];
            var r = -1;
            var x = v.x;
            for (var j = 0; j < bcDof; j++) {
                var bcl = bc.bcList[i0 + j];
                if (bcl < 0) {
                    x[j] = disp[ii];
                    ii++;
                }
                else {
                    r = Math.floor(bcl / 6);
                    x[j] = rests[r].x[j];
                }
            }
            if (r >= 0 && rests[r].coords) {
                v.x = rests[r].coords.toGlobal(x);
            }
            this.dispMax = Math.max(this.dispMax, v.magnitude());
            this.angleMax = Math.max(this.angleMax, v.magnitudeR());
            this.displacement.push(v);
        }
        this.calculated = true;
    };
    // 節点の構造解析結果に値を加える
    // i - 節点のインデックス
    // eps1,str1,se1,eps2,str2,se2 - 表面・裏面の歪，応力，歪エネルギー密度
    Result.prototype.addStructureData = function (i, eps1, str1, se1, eps2, str2, se2) {
        this.strain1[i].add(eps1);
        this.stress1[i].add(str1);
        this.sEnergy1[i] += se1;
        this.strain2[i].add(eps2);
        this.stress2[i].add(str2);
        this.sEnergy2[i] += se2;
    };
    // 節点の構造解析結果に値を掛ける
    // i - 節点のインデックス
    // coef - 計算結果に掛ける係数
    Result.prototype.mulStructureData = function (i, coef) {
        this.strain1[i].mul(coef);
        this.stress1[i].mul(coef);
        this.sEnergy1[i] *= coef;
        this.strain2[i].mul(coef);
        this.stress2[i].mul(coef);
        this.sEnergy2[i] *= coef;
    };
    // 設定を表示に反映させる
    Result.prototype.setConfig = function (disp, contour, component) {
        //const dcoef=parseFloat(this.dispCoef.value);
        var param = parseInt(contour);
        var comp = parseInt(component);
        // const coef,comp,minValue,maxValue;
        //coef=dcoef*Math.min(bounds.size/model.result.dispMax,
        // 	      	      	1/model.result.angleMax);
        // if(param<0){
        //   viewObj.clearContour();
        //   colorBar.clear();
        // }
        this.setContour(param, comp, 0);
        this.minValue = this.minValue;
        this.maxValue = this.maxValue;
        switch (param) {
            case this.DISPLACEMENT:
            case this.TEMPERATURE:
                this.view.setContour(this.value, this.minValue, this.maxValue);
                console.log("fdsa");
                break;
            default:
                this.view.setContour(this.value, this.minValue, this.maxValue);
                console.log("da");
                break;
        }
        //this.colorBar.draw(this.minValue,this.maxValue);
    };
    ;
    // コンター図データを設定する
    // param - データの種類
    // component - データの成分
    // data - コンター図参照
    Result.prototype.setContour = function (param, component, data) {
        if (param < 0)
            return;
        data = data || this;
        var dpara = [data.displacement, data.strain1, data.stress1, data.sEnergy1,
            data.temperature];
        var count = dpara[param].length;
        if (count === 0)
            return;
        this.value.length = 0;
        this.value[0] = data.getData(param, component, 0);
        this.minValue = this.value[0];
        this.maxValue = this.value[0];
        for (var i = 1; i < count; i++) {
            this.value[i] = data.getData(param, component, i);
            this.minValue = Math.min(this.minValue, this.value[i]);
            this.maxValue = Math.max(this.maxValue, this.value[i]);
        }
    };
    ;
    // データを取り出す
    // param - データの種類
    // component - データの成分
    // index - 節点のインデックス
    Result.prototype.getData = function (param, component, index) {
        switch (param) {
            case this.DISPLACEMENT:
                switch (component) {
                    case this.X:
                    case this.Y:
                    case this.Z:
                    case this.RX:
                    case this.RY:
                    case this.RZ:
                        return this.displacement[index].x[component];
                    case this.MAGNITUDE:
                        return this.displacement[index].magnitude();
                }
                break;
            // case this.STRAIN:
            //   if(component<this.SHIFT){
            //   	return this.getTensorComp(this.strain1[index],component);
            //   }
            //   else{
            //   	return this.getTensorComp(this.strain2[index],component-this.SHIFT);
            //   }
            //   break;
            // case this.STRESS:
            //   if(component<this.SHIFT){
            //   	return this.getTensorComp(this.stress1[index],component);
            //   }
            //   else{
            //   	return this.getTensorComp(this.stress2[index],component-this.SHIFT);
            //   }
            //   break;
            // case this.S_ENERGY:
            //   if(component===0){
            //   	return this.sEnergy1[index];
            //   }
            //   else{
            //   	return this.sEnergy2[index];
            //   }
            //   break;
            case this.TEMPERATURE:
                return this.temperature[index];
        }
        return 0;
    };
    ;
    Result = __decorate([
        core_1.Injectable({
            providedIn: 'root'
        })
    ], Result);
    return Result;
}());
exports.Result = Result;
