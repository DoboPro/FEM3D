import { Component, OnInit } from '@angular/core';
import { FemMainService } from 'src/app/providers/FemMain';
import { Result } from 'src/app/providers/Result';
import { Solver } from 'src/app/providers/Solver';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { WaitDialogComponent } from '../wait-dialog/wait-dialog.component';
import { FileIndexService } from '../fileIndex/file-index.service';
import { ViewObjectService } from '../three/geometry/view-object.service';
import { FemDataModel } from 'src/app/providers/FemDataModel';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {
  public myElement = document.getElementById('result');
  public d: string; //変位量の最大
  public FEMlist; //読み込みファイルの一覧

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
    this.onSelectChange(this.fileIndex.selectedIndex);
  }

  // ファイルの選択
  public onSelectChange(value) {
   this.model.clear();
    let v = parseInt(value);
    const data = this.fileIndex.FEMlist[v - 1];
    this.InputData.initModel(data.file);　//FemMainServiceのinitModel()にdata.fileを送る
  }

  // 計算途中に表示されるモーダル
  public modal() {
    //　モーダル(waitDialogcomponent)をひらく
    this.modalService.open(WaitDialogComponent).result.then((result) => {}); //5
    setTimeout(()=>{
    this.maxDisplay();
    },50);
  }

  //計算後、menuバー上に変位量の最大値を表示させる
  public maxDisplay() {
    this.d = this.result.dispMax.toFixed(3);
    const elem = document.getElementById('result').style;
    const myStyle = {
      display: 'inline-block',
    };
    for (const prop in myStyle) {
      elem[prop] = myStyle[prop];
    }
  }

}
