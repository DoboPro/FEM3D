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
  public shellParams: ShellParameter[]; // シェルパラメータ
  // public barParams: any[];          // 梁パラメータ
  public coordinates: any[]; // 局所座標系
  public hasShellBar: boolean; // シェル要素または梁要素を含まない

  constructor(
    public mesh: MeshModel,
    public bc: BoundaryCondition,
    private result: Result
  ) {}

  // データを消去する
  public clear(): void {
    this.materials = new Array();
    this.shellParams = new Array();
    // this.barParams = new Array();
    this.coordinates = new Array();
    this.mesh.clear(); // メッシュモデル
    this.bc.clear(); // 境界条件
    this.result.clear(); // 計算結果
  }

  // モデルを初期化する
  public init(): void {
    const mats = this.materials;
    mats.sort(this.compareLabel);
    this.mesh.nodes.sort(this.compareLabel);
    this.bc.init();
    this.reNumbering();
    this.resetMaterialLabel();
    this.resetParameterLabel();
    this.resetCoordinates();
    this.mesh.checkChirality();
    this.mesh.getFreeFaces();
    this.mesh.getFaceEdges();
    for (let i = 0; i < mats.length; i++) {
      const m2d = mats[i].matrix2Dstress();
      const msh = mats[i].matrixShell();
      const m3d = mats[i].matrix3D();
      mats[i].matrix = { m2d: m2d, msh: msh, m3d: m3d };
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
    // for (let i = 0; i < this.bc.temperature.length; i++) {
    //   this.resetNodePointer(map, this.bc.temperature[i]);
    // }
    map.length = 0;
    for (let i = 0; i < elements.length; i++) {
      map[elements[i].label] = i;
    }
    // for (let i = 0; i < this.bc.pressures.length; i++) {
    //   this.resetElementPointer(map, this.bc.pressures[i]);
    // }
    // for (let i = 0; i < this.bc.htcs.length; i++) {
    //   this.resetElementPointer(map, this.bc.htcs[i]);
    // }
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

  // シェルパラメータ・梁パラメータのポインタを設定する
  public resetParameterLabel(): void {
    if (this.shellParams.length === 0) {
      //} && (this.barParams.length === 0)) {
      this.hasShellBar = false;
      return;
    }
    const map1 = [];
    const map2 = [];
    const elements = this.mesh.elements;
    let shellbars = 0;
    for (let i = 0; i < this.shellParams.length; i++) {
      map1[this.shellParams[i].label] = i;
    }
    // for (let i = 0; i < this.barParams.length; i++) {
    //   map2[this.barParams[i].label] = i;
    // }
    for (let i = 0; i < elements.length; i++) {
      if (elements[i].isShell) {
        if (elements[i].param in map1) {
          elements[i].param = map1[elements[i].param];
          shellbars++;
        } else {
          throw new Error(
            'パラメータ番号' + elements[i].param + 'は存在しません'
          );
        }
      } else if (elements[i].isBar) {
        if (elements[i].param in map2) {
          elements[i].param = map2[elements[i].param];
          shellbars++;
        } else {
          throw new Error(
            'パラメータ番号' + elements[i].param + 'は存在しません'
          );
        }
      }
    }
    this.hasShellBar = shellbars > 0;
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

  // 節点の自由度を設定する
  public setNodeDoF(): number {
    const dof = this.bc.dof;
    const nodeCount = this.mesh.nodes.length;
    const elemCount = this.mesh.elements.length;
    dof.length = 0;
    for (let i = 0; i < nodeCount; i++) {
      dof[i] = 3;
    }
    for (let i = 0; i < elemCount; i++) {
      const elem = this.mesh.elements[i];
      if (elem.isShell || elem.isBar) {
        // シェル要素・梁要素
        const count = elem.nodeCount();
        for (let j = 0; j < count; j++) {
          dof[elem.nodes[j]] = 6;
        }
      }
    }
    return this.bc.setPointerStructure(nodeCount);
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
      if (elem.isShell) {
        const sp = this.shellParams[elem.param];
        let mmat: any;
        if (elem.getName() === 'TriElement1') {
          mmat = mat.m2d;
        } else {
          mmat = mat.msh;
        }
        const s = elem.elementStrainStress(p, v, mmat, sp);
        this.result.addStructureData(i, s[0], s[1], s[2], s[3], s[4], s[5]);
      }
      // else if (elem.isBar) {
      //   const sect = this.barParams[elem.param].section;
      //   const s = elem.elementStrainStress(p, v, material, sect);
      //   this.result.addStructureData(i, s[0], s[1], s[2], s[3], s[4], s[5]);
      // }
      else {
        const s = elem.elementStrainStress(p, v, mat.m3d);
        this.result.addStructureData(i, s[0], s[1], s[2], s[0], s[1], s[2]);
      }
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
      if (elem.isShell) {
        const sp = this.shellParams[elem.param];
        let mmat: any;
        if (elem.getName() === 'TriElement1') {
          mmat = mat.m2d;
        } else {
          mmat = mat.msh;
        }
        const s = elem.strainStress(p, v, mmat, sp);
        const eps1 = s[0];
        const str1 = s[1];
        const se1 = s[2];
        const eps2 = s[3];
        const str2 = s[4];
        const se2 = s[5];
        for (let j = 0; j < en.length; j++) {
          const eaj = ea[j];
          eps1[j].mul(eaj);
          eps2[j].mul(eaj);
          str1[j].mul(eaj);
          str2[j].mul(eaj);
          se1[j] *= eaj;
          se2[j] *= eaj;
          this.result.addStructureData(
            en[j],
            eps1[j],
            str1[j],
            se1[j],
            eps2[j],
            str2[j],
            se2[j]
          );
          angle[en[j]] += eaj;
        }
      } else {
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
    }
    for (let i = 0; i < nodeCount; i++) {
      if (angle[i] !== 0) {
        this.result.mulStructureData(i, 1 / angle[i]);
      }
    }
  }

  // 局所座標系を設定する
  public resetCoordinates(): void {
    if (this.coordinates.length === 0) {
      return;
    }
    const map = [];
    for (let i = 0; i < this.coordinates.length; i++) {
      map[this.coordinates[i].label] = this.coordinates[i];
    }
    for (let i = 0; i < this.bc.restraints.length; i++) {
      this.resetCoordinatesPointer(map, this.bc.restraints[i]);
    }
    for (let i = 0; i < this.bc.loads.length; i++) {
      this.resetCoordinatesPointer(map, this.bc.loads[i]);
    }
  }
  // 局所座標系を再設定する
  // map - ラベルマップ
  // bc - 境界条件
  public resetCoordinatesPointer(map, bc) {
    const coords = bc.coords;
    if (coords === null || coords === undefined) {
    } else if (coords in map) {
      bc.coords = map[coords];
      bc.globalX = bc.coords.toGlobal(bc.x);
    } else {
      throw new Error('局所座標系番号' + coords + 'は存在しません');
    }
  }

  removeObject(obj){
    const scene=new THREE.Scene();					// シーン
    scene.remove(obj);
  };
}
