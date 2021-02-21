"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.ColorBar = void 0;
var core_1 = require("@angular/core");
var ColorBar = /** @class */ (function () {
    function ColorBar(scene) {
        this.scene = scene;
    }
    ColorBar.prototype.OnInit = function () {
        var d = (this.b / 5).toString();
        var e = (this.c / 10).toString();
        var f = (this.b * (3 / 10)).toString();
        var g = (this.c * (4 / 5)).toString();
        this.rect = {
            x: parseInt(d),
            y: parseInt(e),
            width: parseInt(f),
            height: parseInt(g)
        };
        var canvas2 = document.getElementById('myCanvas');
        var ctx = canvas2.getContext('2d');
        console.log(ctx);
        var context = this.canvasElement.getContext('2d');
        this.gradient = context.createLinearGradient(this.rect.x, this.rect.y + this.rect.height, this.rect.x, this.rect.y);
        this.gradient.addColorStop(0, '#0000ff');
        this.gradient.addColorStop(0.25, '#00ffff');
        this.gradient.addColorStop(0.5, '#00cc00');
        this.gradient.addColorStop(0.75, '#ffff00');
        this.gradient.addColorStop(1, '#ff0000');
        var xt = this.rect.x + this.rect.width + 5;
        // 数値表示位置
        var CBAR_FONT_SIZE = 14; // フォントサイズ
        var h = (this.rect.y - CBAR_FONT_SIZE / 2).toString();
        this.maxPos = { x: xt, y: parseInt(h) };
        this.minPos = { x: xt, y: this.maxPos.y + this.rect.height };
    };
    ColorBar.prototype.draw = function (minValue, maxValue) {
        // this.OnInit();
        var z = this.scene.draw(this.a, this.b, this.c);
        console.log(z);
        var FG_COLOR = '#ffffff'; // 前景色
        this.context.clearRect(0, 0, this.Width, this.Height);
        this.context.fillStyle = this.gradient;
        this.context.fillRect(this.rect.x, this.rect.y, this.rect.width, this.rect.height);
        this.context.strokeStyle = FG_COLOR;
        this.context.strokeRect(this.rect.x, this.rect.y, this.rect.width, this.rect.height);
        this.context.fillStyle = FG_COLOR;
        this.context.fillText(this.numString(maxValue), this.maxPos.x, this.maxPos.y);
        this.context.fillText(this.numString(minValue), this.minPos.x, this.minPos.y);
    };
    ColorBar.prototype.numString = function (value) {
        var vabs = Math.abs(value);
        if (vabs >= 1.0e5) {
            return value.toExponential(4);
        }
        else if (vabs >= 1 || vabs === 0) {
            return value.toFixed(3);
        }
        else if (vabs >= 0.01) {
            return value.toFixed(4);
        }
        else {
            return value.toExponential(4);
        }
    };
    ColorBar = __decorate([
        core_1.Injectable({
            providedIn: 'root'
        })
    ], ColorBar);
    return ColorBar;
}());
exports.ColorBar = ColorBar;
