import { Injectable } from '@angular/core';
import * as numeric from '../libs/numeric-1.2.6.min.js';

@Injectable({
  providedIn: 'root',
})
//--------------------------------------------------------------------//
// ３次元対称テンソル
// s - 成分
export class SymmetricTensor3 {
  public EIG_EPS = 1e-10; // 固有値計算の収束閾値

  public xx: number;
  public yy: number;
  public zz: number;
  public xy: number;
  public yz: number;
  public zx: number;

  constructor(s: number[]) {
    this.xx = s[0];
    this.yy = s[1];
    this.zz = s[2];
    this.xy = s[3];
    this.yz = s[4];
    this.zx = s[5];
  }

  // テンソルをベクトルとして返す
  public vector() {
    return [this.xx, this.yy, this.zz, this.xy, this.yz, this.zx];
  }

  // テンソルを加える
  // t - 加えるテンソル
  public add(t: any) {
    this.xx += t.xx;
    this.yy += t.yy;
    this.zz += t.zz;
    this.xy += t.xy;
    this.yz += t.yz;
    this.zx += t.zx;
  }

  // 成分にスカラーを掛ける
  // a - 掛けるスカラー
  public mul(a: number) {
    this.xx *= a;
    this.yy *= a;
    this.zz *= a;
    this.xy *= a;
    this.yz *= a;
    this.zx *= a;
  }

  // 固有値を返す
  public principal() {
    return this.eigenvalue(this, 100).lambda;
  }

  // テンソルを回転させる
  // d - 方向余弦マトリクス
  public rotate(d) {
    const mat = [
      [this.xx, this.xy, this.zx],
      [this.xy, this.yy, this.yz],
      [this.zx, this.yz, this.zz],
    ];
    const s = [0, 0, 0, 0, 0, 0];
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const mij = mat[i][j];
        for (let k = 0; k < 3; k++) {
          s[k] += d[k][i] * d[k][j] * mij;
          s[k + 3] += d[k][i] * d[(k + 1) % 3][j] * mij;
        }
      }
    }
    this.xx = s[0];
    this.yy = s[1];
    this.zz = s[2];
    this.xy = s[3];
    this.yz = s[4];
    this.zx = s[5];
  }

  // テンソルの内積を計算する
  // t - 相手のテンソル
  public innerProduct(t) {
    return (
      this.xx * t.xx +
      this.yy * t.yy +
      this.zz * t.zz +
      2 * (this.xy * t.xy + this.yz * t.yz + this.zx * t.zx)
    );
  }

  // Jacobie法で対称テンソルの固有値を求める
  // Numeric.jsでは対角要素が0（例えばせん断のみの条件）だと求められない
  // st - 対称テンソル
  // iterMax - 反復回数の最大値
  public eigenvalue(st, iterMax) {
    const m = [
      [st.xx, st.xy, st.zx],
      [st.xy, st.yy, st.yz],
      [st.zx, st.yz, st.zz],
    ];

    return this.eigenByJacob(m, iterMax);
  }

  // Jacobie法で対称テンソルの固有値を求める
  // m - 対称行列
  // iterMax - 反復回数の最大値
  public eigenByJacob(m, iterMax) {
    const size = m.length;
    const abs = Math.abs;
    let dataMax = 0;
    let ev = numeric.identity(size);
    for (let i = 0; i < size; i++) {
      for (let j = i; j < size; j++) {
        dataMax = Math.max(dataMax, abs(m[i][j]));
      }
    }
    const tolerance = this.EIG_EPS * dataMax;
    // 値が0の場合
    if (dataMax === 0) return { lambda: numeric.getDiag(m), ev: ev };
    for (let iter = 0; iter < iterMax; iter++) {
      let im = 0;
      let jm = 0;
      let ndMax = 0;
      for (let i = 0; i < 2; i++) {
        for (let j = i + 1; j < 3; j++) {
          const absm = abs(m[i][j]);
          if (absm > ndMax) {
            ndMax = absm;
            im = i;
            jm = j;
          }
        }
      }
      if (ndMax < tolerance) break;
      const mim = m[im];
      const mjm = m[jm];
      const alpha = 0.5 * (mim[im] - mjm[jm]);
      const beta = 0.5 / Math.sqrt(alpha * alpha + ndMax * ndMax);
      const cc2 = 0.5 + abs(alpha) * beta;
      let cs = -beta * mim[jm];
      if (alpha < 0) cs = -cs;
      const cc = Math.sqrt(cc2);
      const ss = cs / cc;
      const aij = 2 * (alpha * cc2 - mim[jm] * cs);
      const aii = mjm[jm] + aij;
      const ajj = mim[im] - aij;
      for (let i = 0; i < 3; i++) {
        const mi = m[i],
          evi = ev[i];
        let a1 = mi[im] * cc - mi[jm] * ss;
        let a2 = mi[im] * ss + mi[jm] * cc;
        mi[im] = a1;
        mi[jm] = a2;
        mim[i] = a1;
        mjm[i] = a2;
        a1 = evi[im] * cc - evi[jm] * ss;
        a2 = evi[im] * ss + evi[jm] * cc;
        evi[im] = a1;
        evi[jm] = a2;
      }
      mim[im] = aii;
      mim[jm] = 0;
      mjm[im] = 0;
      mjm[jm] = ajj;
    }
    m = numeric.getDiag(m);
    // 固有値を大きい順に入れ替える
    const eig = [];
    ev = numeric.transpose(ev);
    for (let i = 0; i < size; i++) eig.push([m[i], ev[i]]);
    eig.sort(function (v1, v2) {
      return v2[0] - v1[0];
    });
    for (let i = 0; i < size; i++) {
      m[i] = eig[i][0];
      ev[i] = eig[i][1];
    }
    return { lambda: m, ev: numeric.transpose(ev) };
  }
}
