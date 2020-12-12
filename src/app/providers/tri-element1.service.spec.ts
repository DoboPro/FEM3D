import { TestBed } from '@angular/core/testing';

import { TriElement1Service } from './tri-element1.service';

describe('TriElement1Service', () => {
  let service: TriElement1Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TriElement1Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
