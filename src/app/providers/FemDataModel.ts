import { Injectable } from '@angular/core';
import { BoundaryCondition } from './boundary/BoundaryCondition';
import { MeshModel } from './mesh/MeshModel';
import { Material } from './material/Material';
import { Result } from './Result';
import { Solver } from './Solver';
import { ShellParameter } from './parameter/ShellParameter';
import * as numeric from './libs/numeric-1.2.6.min.js';
import * as THREE from 'three';


@Injectable({
  providedIn: 'root',
})
export class FemDataModel {
  public COEF_F_W = 0.5 / Math.PI; // f/ω比 1/2π

  public materials: Material[]; // 材料
  public hasShellBar: boolean; // シェル要素または梁要素を含まない

  constructor(
    public mesh: MeshModel,
    public bc: BoundaryCondition,
    private result: Result
  ) {}

  // データを消去する
  public clear(): void {
    this.materials = new Array();
    this.mesh.clear(); // メッシュモデル
    this.bc.clear(); // 境界条件
    this.result.clear(); // 計算結果
  }

  // モデルを初期化する（各パラメータに分類したデータを計算するのに違う定数に代入、並び替え、初期化の残り等を行う。）
  public init(): void {
    // 材料特性の代入(材料番号、ヤング率、、など)
    const mats = this.materials;　            
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

    // ☆Dマトリックス（材料の特性を示すマトリックス）の作成
    for (let i = 0; i < mats.length; i++) {
      const m3d = mats[i].matrix3D();
      mats[i].matrix = { m3d: m3d };
    }
  }

  // ラベルを比較する
  // o1,o2 - 比較する対象
  public compareLabel(o1, o2) {
    if (o1.label < o2.label) {
      return -1;
    } else if (o1.label > o2.label) {
      return 1;
    } else {
      return 0;
    }
  }

  // 節点・要素ポインタを設定する
  public reNumbering(): void {
    const nodes = this.mesh.nodes;
    const elements = this.mesh.elements;
    const map = [];
    for (let i = 0; i < nodes.length; i++) {
      map[nodes[i].label] = i;
    }
    for (let i = 0; i < elements.length; i++) {
      this.resetNodes(map, elements[i]);
    }
    for (let i = 0; i < this.bc.restraints.length; i++) {
      this.resetNodePointer(map, this.bc.restraints[i]);
    }
    for (let i = 0; i < this.bc.loads.length; i++) {
      this.resetNodePointer(map, this.bc.loads[i]);
    }
    map.length = 0;
    for (let i = 0; i < elements.length; i++) {
      map[elements[i].label] = i;
    }
  }

  // 材料ポインタを設定する
  public resetMaterialLabel(): void {
    if (this.materials.length === 0) {
      this.materials.push(new Material(1, 1, 0.3, 1, 1, 1));
    }
    const map = [];
    const elements = this.mesh.elements;
    for (let i = 0; i < this.materials.length; i++) {
      map[this.materials[i].label] = i;
    }
    for (let i = 0; i < elements.length; i++) {
      if (elements[i].material in map) {
        elements[i].material = map[elements[i].material];
      } else {
        throw new Error('材料番号' + elements[i].material + 'は存在しません');
      }
    }
  }

    // 節点集合の節点ラベルを再設定する
  // map - ラベルマップ
  // s - 節点集合
  public resetNodes(map, s) {
    for (let i = 0; i < s.nodes.length; i++) {
      if (s.nodes[i] in map) {
        s.nodes[i] = map[s.nodes[i]];
      } else {
        throw new Error('節点番号' + s.nodes[i] + 'は存在しません');
      }
    }
  }

  // 節点ポインタを再設定する
  // map - ラベルマップ
  // bc - 境界条件
  public resetNodePointer(map, bc) {
    if (bc.node in map) {
      bc.node = map[bc.node];
    } else {
      throw new Error('節点番号' + bc.node + 'は存在しません');
    }
  }

  // 要素ポインタを再設定する
  // map - ラベルマップ
  // bc - 境界条件
  public resetElementPointer(map, bc) {
    if (bc.element in map) {
      bc.element = map[bc.element];
    } else {
      throw new Error('要素番号' + bc.element + 'は存在しません');
    }
  }

  // 節点の自由度を設定する（今回は回転拘束を考慮しないので自由度３になる）
  public setNodeDoF(): number {
    const dof = this.bc.dof;
    const nodeCount = this.mesh.nodes.length;
    dof.length = 0;
    for (let i = 0; i < nodeCount; i++) {
      dof[i] = 3;
    }

    //節点の数だけ自由度3を代入してあるので、dofAllという全節点分の自由度の合計を返してくる。
    return this.bc.setPointerStructure(nodeCount);　// =dofAll
  }

  // 要素歪・応力・歪エネルギー密度を計算する
  public calculateElementStress(): void {
    const nodes = this.mesh.nodes;
    const elems = this.mesh.elements;
    const elemCount = elems.length;
    this.result.initStrainAndStress(elemCount);
    for (let i = 0; i < elemCount; i++) {
      const elem = elems[i],
        en = elem.nodes;
      const p = new Array();
      const v = new Array();
      for (let j = 0; j < en.length; j++) {
        p[j] = nodes[en[j]];
        v[j] = this.result.displacement[en[j]];
      }
      const material = this.materials[elem.material],
        mat = material.matrix;
        const s = elem.elementStrainStress(p, v, mat.m3d);
        this.result.addStructureData(i, s[0], s[1], s[2], s[0], s[1], s[2]);
    }
  }

  // 節点歪・応力・歪エネルギー密度を計算する
  public calculateNodeStress(): void {
    const nodes = this.mesh.nodes;
    const nodeCount = nodes.length;
    const elems = this.mesh.elements;
    const elemCount = elems.length;
    const angle = numeric.rep([nodeCount], 0);
    this.result.initStrainAndStress(nodeCount);
    for (let i = 0; i < elemCount; i++) {
      const elem = elems[i];
      const en = elem.nodes;
      const p: any[] = new Array();
      const v: any[] = new Array();
      for (let j = 0; j < en.length; j++) {
        p[j] = nodes[en[j]];
        v[j] = this.result.displacement[en[j]];
      }
      const material = this.materials[elem.material];
      const mat = material.matrix;
      const ea = elem.angle(p, elem.nodeCount());
    
        const s = elem.strainStress(p, v, mat.m3d);
        const eps1 = s[0];
        const str1 = s[1];
        const se1 = s[2];
        for (let j = 0; j < en.length; j++) {
          const eaj = ea[j];
          eps1[j].mul(eaj);
          str1[j].mul(eaj);
          se1[j] *= eaj;
          this.result.addStructureData(
            en[j],
            eps1[j],
            str1[j],
            se1[j],
            eps1[j],
            str1[j],
            se1[j]
          );
          angle[en[j]] += eaj;
        }
    }
    for (let i = 0; i < nodeCount; i++) {
      if (angle[i] !== 0) {
        this.result.mulStructureData(i, 1 / angle[i]);
      }
    }
  }

  removeObject(obj){
    const scene=new THREE.Scene();					// シーン
    scene.remove(obj);
  };
}
