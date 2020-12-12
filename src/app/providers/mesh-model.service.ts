import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { EdgeBorder1 } from './edge-border1.service';

@Injectable({
  providedIn: 'root'
})
  
// メッシュモデル
export class MeshModel {


  public nodes: any[];      // 節点
  public elements: any[];   // 要素
  public freeFaces: any[];  // 表面
  public faceEdges: any[];  // 表面の要素辺

  constructor() {
    this.clear();
  }

  // データを消去する
  public clear(): void {
    this.nodes = new Array();
    this.elements = new Array();
    this.freeFaces = new Array();
    this.faceEdges = new Array();
  }

  // 要素の鏡像向きを揃える
  public checkChirality() {
    for (let i = 0; i < this.elements.length; i++) {
      const elem = this.elements[i];
      if (!elem.isShell && !elem.isBar) {
        const pe = this.getNodes(elem);
        const pf = this.getNodes(elem.border(i, 0));
        const n1 = this.normalVector(pf);
        const n2 = this.center(pe).sub(this.center(pf));
        if (n1.dot(n2) > 0) {
          elem.mirror();
        }
      }
    }
  }

  // 表面を取り出す
  public getFreeFaces() {
    const elems = this.elements;
    if (elems.length === 0) return;
    this.freeFaces.length = 0;
    const border = [];
    for (let i = 0; i < elems.length; i++) {
      if (elems[i].isShell) {
        this.freeFaces.push(elems[i].border(i, 0));
      }
      else if (!elems[i].isBar) {
        const count = elems[i].borderCount();
        for (let j = 0; j < count; j++) {
          border.push(elems[i].border(i, j));
        }
      }
    }
    if (border.length > 0) {
      border.sort(function (b1, b2) { return b1.compare(b2); });
      let addsw = true
      let beforeEb = border[0];
      for (let i = 1; i < border.length; i++) {
        const eb = border[i];
        if (beforeEb.compare(eb) === 0) {
          addsw = false;
        }
        else {
          if (addsw) this.freeFaces.push(beforeEb);
          beforeEb = eb;
          addsw = true;
        }
      }
      if (addsw) this.freeFaces.push(beforeEb);
    }
  }

  // 表面の要素辺を取り出す
  public getFaceEdges() {
    if (this.freeFaces.length === 0) return;
    this.faceEdges.length = 0;
    const edges = [];
    for (let i = 0; i < this.freeFaces.length; i++) {
      const nds = this.freeFaces[i].cycleNodes();
      for (let j = 0; j < nds.length; j++) {
        edges.push(new EdgeBorder1(i, [nds[j], nds[(j + 1) % nds.length]]));
      }
    }
    if (edges.length > 0) {
      edges.sort(function (b1, b2) { return b1.compare(b2); });
      let beforeEdge = edges[0];
      this.faceEdges.push(beforeEdge);
      for (let i = 1; i < edges.length; i++) {
        const edge = edges[i];
        if (beforeEdge.compare(edge) !== 0) {
          this.faceEdges.push(edge);
          beforeEdge = edge;
        }
      }
    }
  }

  // 節点を返す
  // s - 節点集合
  public getNodes(s) {
    const p = [];
    for (let i = 0; i < s.nodes.length; i++) {
      p[i] = this.nodes[s.nodes[i]];
    }
    return p;
  }

  // 法線ベクトルを返す
  // p - 頂点座標
  public normalVector(p) {
    if (p.length < 3) {
      return null;
    }
    else if ((p.length == 3) || (p.length == 6)) {
      return new THREE.Vector3().subVectors(p[1], p[0]).cross
        (new THREE.Vector3().subVectors(p[2], p[0])).normalize();
    }
    else if ((p.length == 4) || (p.length == 8)) {
      return new THREE.Vector3().subVectors(p[2], p[0]).cross
        (new THREE.Vector3().subVectors(p[3], p[1])).normalize();
    }
    else {
      let vx = 0;
      let vy = 0;
      let vz = 0;
      for (let i = 0; i < p.length; i++) {
        const p1 = p[(i + 1) % p.length]
        const p2 = p[(i + 2) % p.length];
        const norm = new THREE.Vector3().subVectors(p1, p[i]).cross
          (new THREE.Vector3().subVectors(p2, p[i]));
        vx += norm.x;
        vy += norm.y;
        vz += norm.z;
      }
      return new THREE.Vector3(vx, vy, vz).normalize();
    }
  }

  // 重心位置を返す
  // p - 頂点座標
  public center(p) {
    let x = 0;
    let y = 0;
    let z = 0;
    const cc = 1.0 / p.length;
    for (let i = 0; i < p.length; i++) {
      x += p[i].x;
      y += p[i].y;
      z += p[i].z;
    }
    return new THREE.Vector3(cc * x, cc * y, cc * z);
  }

  /*

  // 形状データを取り出す
  public getGeometry() {
    const sb = [];
    for (let i = 0; i < this.freeFaces.length; i++) {
      Array.prototype.push.apply(sb, this.freeFaces[i].splitBorder());
    }
    const pos = new Float32Array(9 * sb.length);
    const norm = new Float32Array(9 * sb.length);
    const colors = new Float32Array(9 * sb.length);
    const geometry = new THREE.BufferGeometry();
    geometry.elements = new Int32Array(3 * sb.length);
    geometry.nodes = new Int32Array(3 * sb.length);
    geometry.angle = new Float32Array(9 * sb.length);
    for (let i = 0; i < sb.length; i++) {
      let i9 = 9 * i
      const v = sb[i].nodes
      const elem = sb[i].element;
      const p = [this.nodes[v[0]], this.nodes[v[1]], this.nodes[v[2]]];
      const n = normalVector(p);
      for (let j = 0; j < 3; j++) {
        let j3 = i9 + 3 * j;
        geometry.elements[3 * i + j] = elem;
        geometry.nodes[3 * i + j] = v[j];
        pos[j3] = p[j].x;
        pos[j3 + 1] = p[j].y;
        pos[j3 + 2] = p[j].z;
        norm[j3] = n.x;
        norm[j3 + 1] = n.y;
        norm[j3 + 2] = n.z;
        colors[j3] = meshColors[0];
        colors[j3 + 1] = meshColors[1];
        colors[j3 + 2] = meshColors[2];
        geometry.angle[j3] = 0;
        geometry.angle[j3 + 1] = 0;
        geometry.angle[j3 + 2] = 0;
      }
    }
    geometry.addAttribute('position', new THREE.BufferAttribute(pos, 3));
    geometry.addAttribute('normal', new THREE.BufferAttribute(norm, 3));
    geometry.addAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geometry;
  }

  // 要素辺の形状データを取り出す
  public getEdgeGeometry() {
    const edges = this.faceEdges;
    const pos = new Float32Array(6 * edges.length);
    const geometry = new THREE.BufferGeometry();
    geometry.nodes = new Int32Array(2 * edges.length);
    geometry.angle = new Float32Array(6 * edges.length);
    for (let i = 0; i < edges.length; i++) {
      let i2 = 2 * i, i6 = 6 * i, v = edges[i].nodes;
      const p1 = this.nodes[v[0]], p2 = this.nodes[v[1]];
      geometry.nodes[i2] = v[0];
      geometry.nodes[i2 + 1] = v[1];
      pos[i6] = p1.x;
      pos[i6 + 1] = p1.y;
      pos[i6 + 2] = p1.z;
      pos[i6 + 3] = p2.x;
      pos[i6 + 4] = p2.y;
      pos[i6 + 5] = p2.z;
      for (let j = 0; j < 6; j++) geometry.angle[i6 + j] = 0;
    }
    geometry.addAttribute('position', new THREE.BufferAttribute(pos, 3));
    return geometry;
  }

  // 梁要素の形状データを取り出す
  public getBarGeometry() {
    const geometry = new THREE.BufferGeometry();
    geometry.param = [];
    geometry.dir = [];
    const elems = this.elements
    const bars = []
    const axis = [];
    for (let i = 0; i < elems.length; i++) {
      if (elems[i].isBar) {
        bars.push(elems[i].border(i, 0));
        geometry.param.push(model.barParams[elems[i].param].section);
        axis.push(elems[i].axis);
      }
    }
    const pos = new Float32Array(6 * bars.length);
    const colors = new Float32Array(6 * bars.length);
    geometry.elements = new Int32Array(2 * bars.length);
    geometry.nodes = new Int32Array(2 * bars.length);
    geometry.angle = new Float32Array(6 * bars.length);
    for (let i = 0; i < bars.length; i++) {
      const i2 = 2 * i
      const i6 = 6 * i
      const v = bars[i].nodes
      const elem = bars[i].element;
      const p1 = this.nodes[v[0]], p2 = this.nodes[v[1]];
      geometry.dir.push(this.elem.dirVectors([p1, p2], axis[i]));
      geometry.elements[i2] = elem;
      geometry.elements[i2 + 1] = elem;
      geometry.nodes[i2] = v[0];
      geometry.nodes[i2 + 1] = v[1];
      pos[i6] = p1.x;
      pos[i6 + 1] = p1.y;
      pos[i6 + 2] = p1.z;
      pos[i6 + 3] = p2.x;
      pos[i6 + 4] = p2.y;
      pos[i6 + 5] = p2.z;
      for (let j = 0; j < 3; j++) {
        colors[i6 + j] = meshColors[j];
        colors[i6 + j + 3] = meshColors[j];
        geometry.angle[i6 + j] = 0;
        geometry.angle[i6 + j + 3] = 0;
      }
    }
    geometry.addAttribute('position', new THREE.BufferAttribute(pos, 3));
    geometry.addAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geometry;
  }
  */
}