import { Component, OnInit } from '@angular/core';
import { FemMainService } from 'src/app/providers/FemMain';
import { FemObjectService } from '../three/geometry/fem-object.service'
import { Solver } from 'src/app/providers/Solver';
import { ThreeService } from '../three/three.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {

  constructor(public InputData: FemObjectService,
              public Solver: Solver) { }

  ngOnInit(): void {
    this.renew();
  }

  // 計算
  public calcurate() {
    this.Solver.calcStart();
  }


  // 新規作成
  public renew(): void {
    this.InputData.readLocalFile('assets/beam/sampleBeamHexa1.fem');
  }


}
