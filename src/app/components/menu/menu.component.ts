import { Component, OnInit } from '@angular/core';
import { FemMainService } from 'src/app/providers/FemMain';
import { Result } from 'src/app/providers/Result';
import { Solver } from 'src/app/providers/Solver';
import { ThreeService } from '../three/three.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {
  public myElement = document.getElementById('result');
  public d: string;

  constructor(
    public InputData: FemMainService,
    public result: Result,
    public Solver: Solver
  ) {}

  ngOnInit(): void {
    this.renew();
  }

  // 計算
  public calcrate() {
    //計算開始
    this.Solver.calcStart();

    //計算後、menuバー上に変位量の最大値を表示させる
    const w = this.result.dispMax.toFixed(3);
    this.d = w;
    // const w:number = this.d.toFixed(3);
    const elem = document.getElementById('result').style;
    const myStyle = {
      display: 'block',
    };
    for (const prop in myStyle) {
      elem[prop] = myStyle[prop];
    }

    //コンター図を出す
    this.Solver.conterStart();
  }

  // 新規作成
  public renew(): void {
    this.InputData.initModel('assets/ground/groundsimpleHexa2.fem');
    //this.InputData.initModel('assets/bend/sampleBendHexa1.fem');
  }
}
