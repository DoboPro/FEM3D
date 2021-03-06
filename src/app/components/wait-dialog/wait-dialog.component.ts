import { Component, OnInit, AfterViewInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Solver } from 'src/app/providers/Solver';
// import { Result } from 'src/app/providers/Result';

@Component({
  selector: 'app-wait-dialog',
  templateUrl: './wait-dialog.component.html',
  styleUrls: ['./wait-dialog.component.scss'],
})
export class WaitDialogComponent implements AfterViewInit {
  constructor(
    public activeModal: NgbActiveModal,
    public Solver: Solver,
    // public result: Result
  ) {}

  ngAfterViewInit() {
    console.log("sasa-WaitDialogComponent ngAfterContentInit");

    setTimeout(()=>{
      const solve = this.Solver.calcStart();
      console.log('sasa- calcrate end');
      this.Solver.conterStart();
      console.log('sasa- activeModal.conterStart');
      this.activeModal.close('e');
      console.log('sasa- activeModal.close');
    },1);


    // console.log(solve);
    // //計算後、menuバー上に変位量の最大値を表示させる
    // const w = this.result.dispMax.toFixed(3);
    // const d = w;
    // //コンター図を出す


    
  }
  // 計算
  // public calcrate() {
  //   //計算開始
  //   const solve = this.Solver.calcStart();
  //   console.log(solve);
  //   //計算後、menuバー上に変位量の最大値を表示させる
  //   const w = this.result.dispMax.toFixed(3);
  //   const d = w;
  //   //コンター図を出す
  //   this.Solver.conterStart();
  // }
}
