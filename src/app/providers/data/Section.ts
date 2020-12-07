import * as THREE from 'three';
import { Material } from './Material';

class Section {
    public CIRCLE_DIV = 16;			// 円形断面表示オブジェクトの分割数
    public CIRCLE_DTH = 2 * Math.PI / this.CIRCLE_DIV;	// 円形断面の１分割の角度
    public COEF_K1 = 64 / Math.pow(Math.PI, 5);	// 矩形断面の捩り係数
    public COEF_K = 8 / (Math.PI * Math.PI);
    
    constructor(){}
}

// 円形断面
export class CircleSection extends Section {

    static KS_CIRCLE = 6/7;    // 円形断面のせん断補正係数

    public d1: number;	// 外径
    public d2: number;	// 内径

    public area: number; // 断面積
    // 断面２次モーメント
    public iy: number;
    public iz: number;
 	// 断面２次極モーメント
    public ip: number;

    constructor(ss: string[]){
        super();

        this.d1 = parseFloat(ss[0]);	// 外径
        this.d2 = parseFloat(ss[1]);	// 内径
        // 断面積
        this.area = 0.25 * Math.PI * ( this.d1 * this.d1 - this.d2 * this.d2 );
        // 断面２次モーメント
        this.iy = 0.0625 * this.area * ( this.d1 * this.d1 + this.d2 * this.d2 );
        this.iz = this.iy;
        this.ip = this.iy + this.iz;	// 断面２次極モーメント
    }


    // 断面の頂点数を返す
    public vertexCount(): number{
        return this.CIRCLE_DIV;
    }

    // せん断補正係数を返す
    public shearCoef(): number{
        return CircleSection.KS_CIRCLE;
    }

    // 歪・応力ベクトルを返す
    // material - 材料
    // ex - 引張圧縮歪
    // thd - 比捩り角
    // kpy,kpz - 曲げによる曲率
    // sy,sz - 断面せん断歪
    public strainStress(material: Material, 
                        ex: number, thd: number, 
                        kpy: number, kpz: number,
                        sy: number, sz: number ): number[][] {
        const kp: number = Math.sqrt( kpy * kpy + kpz * kpz )
        const kpr: number = 0.5 * kp * this.d1;
        const gx: number = 0.5 * this.d1 * thd;
        let gy: number = 0
        let gz: number = gx;

        if( kp > 0 ){
            gy = -gx * kpz / kp;
            gz = gx * kpy / kp;
        }
        const ee: number = material.ee;
        const gg: number = material.gg;
        return [[ ex + kpr, 0, 0, gy + sy, 0, gz + sz ],
                [ ee * ( ex + kpr ), 0, 0, gg * ( gy + sy ), 0, gg * ( gz + sz )],
                [ ex - kpr, 0, 0, -gy + sy, 0, -gz + sz ],
                [ ee * ( ex - kpr ), 0, 0, gg * ( -gy + sy ), 0, gg * ( -gz + sz )]];
    }
  
    // 断面表示モデルの座標系を設定する
    // pos1,pos2 - 外径，内径の座標
    // cx,cy,cz - 中心点座標
    // v1,v2 - 軸方向，断面基準方向ベクトル
    public setCoords(pos1: number[], pos2: number[], 
                    cx: number, cy: number, cz: number, 
                    v1: THREE.Vector3, v2: THREE.Vector3): void{
        const r1 = 0.5 * this.d1
        const r2 = 0.5 * this.d2;
        for(let j = 0; j < pos1.length; j += 3){
            pos1[j] = cx + r1 * v2.x;
            pos1[j + 1] = cy + r1 * v2.y;
            pos1[j + 2] = cz + r1 * v2.z;
            pos2[j] = cx + r2 * v2.x;
            pos2[j + 1] = cy + r2 * v2.y;
            pos2[j + 2] = cz + r2 * v2.z;
            v2.applyAxisAngle(v1, this.CIRCLE_DTH);
        }
    }
  
    // 質量・重心周りの慣性モーメントを返す
    // dens - 密度
    // l - 要素長さ
    public massInertia(dens: number, l: number ): number[]{
        const dl: number = dens * l;
        const dly = dl * this.iy;
        return [ dl * this.area, 2 * dly, dly, dly];
    }
  
  // 断面を表す文字列を返す
  public toString(): string{
    return this.d1 + '\t' + this.d2;
  };


}


export class RectSection extends Section {
    
    static KS_RECT = 5/6;			// 矩形断面のせん断補正係数

    public b1: number;	// 外側幅
    public h1: number;	// 外側高さ
    public b2: number;	// 内側幅
    public h2: number;	// 内側高さ
    // 断面積
    public area: number;
    // 断面２次モーメント
    public iy: number;
    public iz: number;
    public zy: number;
    public zz: number;
    // 断面２次極モーメント
    public ip: number;

    constructor(ss: string[]){

        super();

        const b1: number = parseFloat(ss[0]);
        const h1: number = parseFloat(ss[1]);
        const b2: number = parseFloat(ss[2]);
        const h2: number = parseFloat(ss[3]);
        this.b1 = b1;	// 外側幅
        this.h1 = h1;	// 外側高さ
        this.b2 = b2;	// 内側幅
        this.h2 = h2;	// 内側高さ
          // 断面積
        this.area = b1 * h1 - b2 * h2;
          // 断面２次モーメント
        const i11: number = b1 * b1 * b1 * h1;
        const i12: number = b1 * h1 * h1 * h1;
        const i21: number = b2 * b2 * b2 * h2;
        const i22: number = b2 * h2 * h2 * h2;
        this.iy = ( i11 - i21 ) / 12;
        this.iz = ( i12 - i22 ) / 12;
        const sw1: boolean = (b1>=h1);
        const sw2: boolean = (b2>=h2);
        let k1: number[];
        let k2: number[];
        let ip1: number;
        let ip2: number;
        if(sw1){
          k1 = this.rectCoef( b1 / h1 );
          ip1 = k1[0] * i12;
          this.zy = k1[1] * h1;
          this.zz = k1[3] * this.zy;
        }
        else{
          k1 = this.rectCoef( h1 / b1);
          ip1 = k1[0] * i11;
          this.zz = k1[1] * b1;
          this.zy = k1[3] * this.zz;
        }
        if(i22 === 0){
          ip2 = 0;
        }
        else if(sw2){
          k2 = this.rectCoef( b2 / h2 );
          ip2 = k2[0] * i22;
        }
        else {
          k2 = this.rectCoef( h2 / b2 );
          ip2 = k2[0] * i21;
        }
        this.ip = ip1 - ip2;    // 断面２次極モーメント
    }

    
    // 断面の頂点数を返す
    public vertexCount(): number{
        return 4;
    };
  
    // せん断補正係数を返す
    public shearCoef():number{
        return RectSection.KS_RECT;
    };
  
  // 歪・応力ベクトルを返す
  // material - 材料
  // ex - 引張圧縮歪
  // thd - 比捩り角
  // kpy,kpz - 曲げによる曲率
  // sy,sz - 断面せん断歪
  public strainStress(material: Material,
                      ex: number, thd: number,
                      kpy: number, kpz: number,
                      sy: number, sz: number ): number[][] {
    const sby: number = 0.5 * kpy * this.b1
    const sbz: number = 0.5 * kpz * this.h1;
    const gy: number = this.zy * thd;
    const gz: number = this.zz * thd;
    const ee: number = material.ee;
    const gg: number = material.gg;
    const eps = [[ ex + sby, sy, sz + gz ], [ ex + sby + sbz, sy, sz ], [ ex + sbz, sy - gy, sz ],
                 [ ex - sby + sbz, sy, sz ], [ ex - sby, sy, sz - gz ], [ ex - sby - sbz, sy, sz ],
                 [ ex - sbz, sy + gy, sz ], [ ex + sby - sbz, sy, sz ]];
    let imax = 0;
    let enmax = 0;
    for ( let i = 0; i < 8; i++ ) {
      const ei = eps[i];
      const en = ee * ei[0] * ei[0] + gg * ( ei[1] * ei[1] + ei[2] * ei[2] );
      if ( en > enmax ){
        imax = i;
        enmax = en;
      }
    }
    if( eps[imax][0] < 0){ 
        imax = ( imax + 4 ) % 8;
    }
    const eps1 = eps[imax];
    const eps2 = eps[ (imax + 4) % 8];
    return [[ eps1[0], 0, 0, eps1[1], 0, eps1[2] ],
            [ ee * eps1[0], 0, 0, gg * eps1[1], 0, gg * eps1[2] ],
            [ eps2[0], 0, 0, eps2[1], 0, eps2[2] ],
            [ ee * eps2[0], 0, 0, gg * eps2[1], 0, gg * eps2[2] ]];
  }
  
  // 断面表示モデルの座標系を設定する
  // pos1,pos2 - 外径，内径の座標
  // cx,cy,cz - 中心点座標
  // v1,v2 - 軸方向，断面基準方向ベクトル
  public setCoords(pos1: number[], pos2: number[],
                   cx: number, cy: number, cz: number,
                   v1: THREE.Vector3,v2: THREE.Vector3): void {

    const v3 = new THREE.Vector3().crossVectors( v1, v2 );
    const c1 = [ 0.5, -0.5, -0.5, 0.5, 0.5 ];
    const c2 = [ 0.5, 0.5, -0.5, -0.5, 0.5 ];
    for ( let j = 0; j < c1.length; j++ ) {
      const j3 = 3 * j;
      pos1[ j3 ] = cx + c1[j] * this.b1 * v2.x + c2[j] * this.h1 * v3.x;
      pos1[ j3 + 1 ] = cy + c1[j] * this.b1 * v2.y + c2[j] * this.h1 * v3.y;
      pos1[ j3 + 2 ] = cz + c1[j] * this.b1 * v2.z + c2[j] * this.h1 * v3.z;
      pos2[ j3 ] = cx + c1[j] * this.b2 * v2.x + c2[j] * this.h2 * v3.x;
      pos2[ j3 + 1 ] = cy + c1[j] * this.b2 * v2.y + c2[j] * this.h2 * v3.y;
      pos2[ j3 + 2 ] = cz + c1[j] * this.b2 * v2.z + c2[j] * this.h2 * v3.z;
    }
  }
  
  // 質量・重心周りの慣性モーメントを返す
  // dens - 密度
  // l - 要素長さ
  public massInertia(dens: number,l: number): number[]{
    const dl = dens * l;
    const dly = dl * this.iz;
    const dlz = dl * this.iy;
    return [ dl * this.area, dly + dlz, dly, dlz ];
  }
  
  // 断面を表す文字列を返す
  public toString(): string {
    return this.b1 + '\t' + this.h1 + '\t' + this.b2 + '\t'+this.h2;
  }
  
  // 矩形断面の捩り係数を求める
  // ba - 辺の長さ比b/a
  public rectCoef(ba: number): number[]{
    let dk1s = 0;
    let dks = 0;
    let dbs = 0;
    const pba = 0.5 * Math.PI * ba;
    let i = 1;
    let dk1: number;
    let dk: number;
    let db: number;
    let ex: number;
    let sg: number = 1;
    do {
        ex = Math.exp( -2 * pba * i );
        dk1 = ( 1 - ex ) / ( ( i + ex ) * Math.pow( i, 5 ));	// IEは双曲線関数未実装
        dk1s += dk1;
        i += 2;
    } while ( dk1 / dk1s > 1e-10 );
    i = 1;
    do {
      dk = 2 / ( ( Math.exp( pba * i ) + Math.exp( -pba * i )) * i * i );
      dks += dk;
      i += 2;
    } while( dk / dks > 1e-10);
    i = 1;
    do {
      ex = Math.exp( -2 * pba * i );
      db = sg * ( 1 - ex ) / ( ( i + ex ) * i * i );
      dbs += db;
      i += 2;
      sg =- sg;
    } while( Math.abs( db / dbs ) > 1e-12 );
    const k1: number = 1 / 3 - this.COEF_K1 * dk1s / ba;
    const k = 1 - this.COEF_K * dks;
    const b = this.COEF_K * dbs;
    return [ k1, k, k1 / k, b / k ];
  }
 
}