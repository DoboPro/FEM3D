import { Component, OnInit } from '@angular/core';
import { FemMainService } from 'src/app/providers/fem-main.service';
import { ThreeService } from '../three/three.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {

  constructor(public InputData: FemMainService) { }

  ngOnInit(): void {
    this.renew();
  }

  // 計算
  public calcrate() {
  }


  // 新規作成
  public renew(): void {
    this.InputData.initModel('assets/bend/sampleBendHexa1.fem');
  }


}
