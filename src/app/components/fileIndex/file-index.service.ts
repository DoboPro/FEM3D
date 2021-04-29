import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FileIndexService {
  public selectedIndex = "1";    // スペクトルの種類

  public FEMlist: any[] = [
    { id: '1', name: '片持ち梁', file: 'assets/beam/sampleBeamHexa1_1.fem' },
    { id: '2', name: '片持ち梁(分割数多め)', file: 'assets/beam/sampleBeamHexa1_2.fem' },
    { id: '3', name: '曲がり梁', file: 'assets/bend/sampleBendHexa1.fem' },
    { id: '4', name: '地盤もどき(mesh分割数多め)', file: 'assets/ground/groundsimpleHexa.fem' },
    { id: '5', name: '地盤もどき(mesh分割数少なめ)', file: 'assets/ground/groundsimpleHexa2.fem' },
    { id: '6', name: '地盤もどき(ちいさい)', file: 'assets/ground/groundsimpleHexa3.fem' },
    { id: '7', name: '地盤もどき(8)', file: 'assets/ground/groundsimpleHexa4.fem' },
  ];

  constructor() { }
}
