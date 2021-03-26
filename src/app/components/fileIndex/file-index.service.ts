import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FileIndexService {
  public selectedIndex = "1";    // スペクトルの種類

  public FEMlist: any[] = [
    { id: '1', name: '片持ち梁', file: 'assets/beam/sampleBeamHexa1.fem' },
    { id: '2', name: '曲がり梁', file: 'assets/bend/sampleBendHexa1.fem' },
    { id: '3', name: '地盤もどき(mesh分割数多め)', file: 'assets/ground/groundsimpleHexa.fem' },
    { id: '4', name: '地盤もどき(mesh分割数少なめ)', file: 'assets/ground/groundsimpleHexa2.fem' },
    { id: '5', name: '地盤もどき(ちいさい)', file: 'assets/ground/groundsimpleHexa4.fem' },
  ];

  constructor() { }
}
