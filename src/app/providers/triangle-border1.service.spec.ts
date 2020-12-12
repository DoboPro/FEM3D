import { TestBed } from '@angular/core/testing';

import { TriangleBorder1Service } from './triangle-border1.service';

describe('TriangleBorder1Service', () => {
  let service: TriangleBorder1Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TriangleBorder1Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
