import { Component, OnInit } from '@angular/core';
import { FemMainService } from 'src/app/providers/FemMain';
import { Result } from 'src/app/providers/Result';
import { Solver } from 'src/app/providers/Solver';
import { ThreeService } from '../three/three.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { WaitDialogComponent } from '../wait-dialog/wait-dialog.component';
import { FileIndexService } from '../fileIndex/file-index.service';
import { Bounds } from 'src/app/providers/Bounds';
import { Mesh } from 'three';
import { ViewObjectService } from '../three/geometry/view-object.service';
import { FemDataModel } from 'src/app/providers/FemDataModel';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {
  public myElement = document.getElementById('result');
  public d: string;
  public FEMlist;

  constructor(
    private modalService: NgbModal,
    public InputData: FemMainService,
    public result: Result,
    public Solver: Solver,
    public fileIndex: FileIndexService,
    public viewObj:ViewObjectService,
    public model:FemDataModel
  ) {
    this.FEMlist = this.fileIndex.FEMlist;
  }

  ngOnInit(): void {
    // this.renew();
    this.onSelectChange(this.fileIndex.selectedIndex);
  }

  public dammy() {
    console.log('da');
  }

  onSelectChange(value) {
   this.model.clear();
    // constviewObj=new ViewObject();
    let v = parseInt(value);
    const data = this.fileIndex.FEMlist[v - 1];

    this.InputData.initModel(data.file);
    // this.get(item.file, item.name);

    //this.fileIndex.FEMlist = value;
  }

  // 計算
  public calcrate() {
    // モーダルを開く
    console.log('sasa-calcrate start');

    //計算開始
    const solve = this.Solver.calcStart();
    console.log(solve);
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
    console.log('sasa- calcrate end');
  }
  public modal() {
    this.dammy(); //1

    //const modalRef =
    this.modalService.open(WaitDialogComponent).result.then((result) => {}); //5
    // .result.then((result) => {
    //   this.d = result;
    //   // const w:number = this.d.toFixed(3);
    //   const elem = document.getElementById('result').style;
    //   const myStyle = {
    //     display: 'block',
    //   };
    //   for (const prop in myStyle) {
    //     elem[prop] = myStyle[prop];
    //   }
    // });
    //this.calcrate();//2,3
    // this.calcrate();
    //モーダルを閉じる
    //modalRef.close(); //4
    //console.log('sasa - modalRef.close()');
  }

  // 新規作成
  public renew(): void {
    this.InputData.initModel('assets/ground/groundsimpleHexa2.fem');
    //this.InputData.initModel('assets/bend/sampleBendHexa1.fem');
  }
}
