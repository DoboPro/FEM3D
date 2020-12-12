import { Component, OnInit } from '@angular/core';
import { FemMainService } from 'src/app/providers/fem-main.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {

  constructor(public FEM: FemMainService) { }

  ngOnInit(): void {
    this.renew();
  }

  // 計算
  public calcrate() {
    this.FEM.calcStart();
  }


  // 新規作成
  public renew(): void {
    this.FEM.initModel('assets/shell/shellBeamQuad1.fem');
  }


}
