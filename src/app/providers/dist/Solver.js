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
    function Solver(model, view, result, bounds, three) {
        this.model = model;
        this.view = view;
        this.result = result;
        this.bounds = bounds;
        this.three = three;
        this.PRECISION = 1e-10; // マトリクス精度
        this.LU_METHOD = 0; // LU分解法
        this.ILUCG_METHOD = 1; // 不完全LU分解共役勾配法
        this.ILUCG_THRES = 1e-10; // 不完全LU分解共役勾配法の収束閾値のデフォルト値
        this.clear();
        // this.method = this.LU_METHOD; //直接解法
        this.method = this.ILUCG_METHOD; //反復解法
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
            //　計算にかかる時間の計測（データ不足で計算できない場合はalertメッセージを出す）
            var t0 = new Date().getTime();
            var calc = false;
            if (this.model.bc.restraints.length > 0) {
                // モデルの自由度を調べる
                this.dof = this.model.setNodeDoF();
                // dofAllを求めた後、剛性マトリクス・荷重ベクトルを作成する
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
            var dcoef = 1; //10;
            var dispMax = this.result.dispMax;
            var angleMax = this.result.angleMax;
            var coef = dcoef * Math.min(this.bounds.size / dispMax, 1 / angleMax);
            this.view.setDisplacement(disp, coef);
            this.three.ChangeMode('disp');
            console.log('Calculation time:' + (t1 - t0) + 'ms');
        }
        catch (ex) {
            alert(ex);
        }
    };
    //コンター
    Solver.prototype.conterStart = function () {
        try {
            var disp = 0;
            this.result.setConfig('0', '6');
        }
        catch (ex1) {
            alert(ex1);
        }
    };
    // ☆剛性マトリクス・荷重ベクトルを作成する
    Solver.prototype.createStiffnessMatrix = function () {
        var bc = this.model.bc;
        // 自由度を減らすための準備（境界条件を設定した節点のリストを定義する）
        var bcList = bc.bcList;
        // 変位が0である点を取り除きたい　
        var reducedList = new Array();
        for (var i = 0; i < bcList.length; i++) {
            if (bcList[i] < 0) {
                reducedList.push(i);
            }
        }
        // 変位が0でない節点をreducedListに入れる。
        // 剛性マトリクスの作成
        var matrix1 = this.stiffnessMatrix(this.dof); //dofは自由度
        // matrix1には自由度を減らしていない全体剛性マトリクスが生成
        // 荷重ベクトルの作成
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
    // 剛性マトリクスを作成する
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
            km = elem.stiffnessMatrix(mesh.getNodes(elem), mat.m3d);
            kmax = this.setElementMatrix(elem, 3, matrix, km, kmax);
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
    // 要素のマトリクスを設定する
    // element - 要素
    // dof - 自由度
    // matrix - 全体剛性マトリクス
    // km - 要素の剛性マトリクス
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
        return this.solveILU(this.toSparse(this.matrix), this.getILU(this.matrix), this.vector);
    };
    // 反復解法（不完全LU分解共役勾配法）
    // 不完全LU分解をする
    // a - 行列
    Solver.prototype.getILU = function (a) {
        var m = a.length, i, j, diag = [], col = [], val = [], d = [], colData = [];
        for (i = 0; i < m; i++) {
            col[i] = [];
            val[i] = [];
            diag[i] = -1;
            colData[i] = [];
        }
        // 列からの検索用ポインタを設定する
        for (i = 0; i < m; i++) {
            var arow = a[i];
            var cols = [];
            for (j in arow) {
                if (arow.hasOwnProperty(j)) {
                    cols.push(parseInt(j));
                }
            }
            cols.sort(function (c1, c2) {
                return c1 - c2;
            });
            for (j = 0; j < cols.length; j++) {
                var cj = cols[j];
                if (cj === i) {
                    diag[i] = j;
                    d[cj] = colData[cj].length;
                }
                col[i].push(cj);
                val[i].push(arow[cj]);
                colData[cj].push(i);
            }
        }
        // 不完全LU分解をする
        for (var k = 0; k < m - 1; k++) {
            var vk = val[k], ck = col[k], dk = diag[k], cdk = colData[k];
            if (dk < 0 || vk[dk] === 0)
                throw new Error('対角成分が0です');
            var dkk = 1 / vk[dk];
            for (j = dk + 1; j < ck.length; j++) {
                vk[j] *= dkk;
            }
            var i0 = d[k] + 1, i1 = cdk.length;
            for (i = i0; i < i1; i++) {
                var row = cdk[i], vrow = val[row], crow = col[row];
                var c = crow.indexOf(k);
                if (c >= 0) {
                    var vik = -vrow[c];
                    for (j = dk + 1; j < ck.length; j++) {
                        c = crow.indexOf(ck[j]);
                        if (c >= 0) {
                            vrow[c] += vik * vk[j];
                        }
                    }
                }
            }
        }
        var rowData = [], valData = [], count = 0;
        colData.length = 0;
        rowData.push(count);
        for (i = 0; i < m; i++) {
            diag[i] += count;
            count += col[i].length;
            rowData.push(count);
            Array.prototype.push.apply(colData, col[i]);
            Array.prototype.push.apply(valData, val[i]);
            valData[diag[i]] = 1 / valData[diag[i]];
        }
        return [rowData, colData, valData, diag];
    };
    // LU分解法で連立方程式の解を求める
    // lu - LU分解した疎行列
    // p - ベクトル
    Solver.prototype.solveLU = function (lu, p) {
        var row = lu[0], col = lu[1], val = lu[2], diag = lu[3], m = row.length - 1;
        var q = [], i, j, j1;
        q[0] = p[0] * val[diag[0]];
        for (i = 1; i < m; i++) {
            var p2 = p[i], j0 = row[i];
            j1 = diag[i];
            for (j = j0; j < j1; j++) {
                p2 -= val[j] * q[col[j]];
            }
            q[i] = p2 * val[j1];
        }
        for (i = m - 2; i >= 0; i--) {
            j1 = diag[i] + 1;
            var q2 = q[i], j2 = row[i + 1];
            for (j = j1; j < j2; j++) {
                q2 -= val[j] * q[col[j]];
            }
            q[i] = q2;
        }
        return q;
    };
    // 不完全LU分解共役勾配法で連立方程式の解を求める
    // matrix - 元の行列
    // ilu - 不完全LU分解した疎行列
    // p - ベクトル
    // iterMax - 反復回数の上限
    // thres - 収束閾値
    Solver.prototype.solveILU = function (matrix, ilu, p) {
        var iterMax = p.length;
        var thres = this.ILUCG_THRES;
        var x = numeric.rep([p.length], 0), xg = p.concat();
        var xq = this.solveLU(ilu, xg);
        var xd = xq.concat(), j;
        for (var iter = 0; iter < iterMax; iter++) {
            var z1 = numeric.dotVV(xd, xg);
            xq = this.sparseDotMV(matrix, xd);
            var r = numeric.dotVV(xd, xq);
            if (Math.abs(r) === 0) {
                throw new Error('方程式求解エラー at iter=' + iter);
            }
            var alpha = z1 / r;
            for (j = 0; j < xg.length; j++) {
                x[j] += alpha * xd[j];
                xg[j] -= alpha * xq[j];
            }
            if (numeric.dotVV(xg, xg) < thres)
                return x;
            var xq2 = this.solveLU(ilu, xg);
            var z2 = numeric.dotVV(xq, xq2);
            var beta = -z2 / r;
            for (j = 0; j < xg.length; j++) {
                xd[j] = beta * xd[j] + xq2[j];
            }
        }
        return x;
    };
    // 行列とベクトルの積を計算する
    // matrix - 疎行列
    // x - ベクトル
    Solver.prototype.sparseDotMV = function (matrix, x) {
        var row = matrix[0], col = matrix[1], val = matrix[2], m = row.length - 1, y = [];
        for (var i = 0; i < m; i++) {
            var y0 = 0, j0 = row[i], j1 = row[i + 1];
            for (var j = j0; j < j1; j++) {
                y0 += val[j] * x[col[j]];
            }
            y[i] = y0;
        }
        return y;
    };
    // 行ベースの疎行列に変換する
    // a - 元の行列
    Solver.prototype.toSparse = function (a) {
        var m = a.length, count = 0, row = [], col = [], val = [], j;
        row.push(count);
        for (var i = 0; i < m; i++) {
            var arow = a[i];
            var cols = [];
            for (j in arow) {
                if (arow.hasOwnProperty(j)) {
                    cols.push(parseInt(j));
                }
            }
            cols.sort(function (c1, c2) {
                return c1 - c2;
            });
            count += cols.length;
            row.push(count);
            Array.prototype.push.apply(col, cols);
            for (j = 0; j < cols.length; j++) {
                val.push(arow[cols[j]]);
            }
        }
        return [row, col, val];
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
    // matrix1,vector1 - 元のマトリクス,ベクトル
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
    // mrow - 元のマトリクスの行データ
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
