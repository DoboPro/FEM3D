import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FileIndexService {
  public selectedIndex = '1';

  public FEMlist: any[] = [
    { id: '1', name: '片持ち梁', file: 'assets/beam/beamHexa_mesh_l.fem' },
    {
      id: '2',
      name: '片持ち梁(分割数多め)',
      file: 'assets/beam/beamHexa_mesh_m.fem',
    },
    { id: '3', name: '曲がり梁', file: 'assets/bend/bendHexa.fem' },
    {
      id: '4',
      name: '地盤(拘束条件のみ考慮)',
      file: 'assets/ground/groundHexa.fem',
    },
    {
      id: '5',
      name: 'フィンガースピナー',
      file: 'assets/finger/finger.fem',
    },
  ];

  constructor() {}
}
