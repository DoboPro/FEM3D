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

    setTimeout(()=>{
      //計算開始
      this.Solver.calcStart();
      console.log('calcrate end');
      this.Solver.conterStart();
      console.log('activeModal.conterStart');
      this.activeModal.close('e');
      console.log('activeModal.close');
    },1); 
  }
}
