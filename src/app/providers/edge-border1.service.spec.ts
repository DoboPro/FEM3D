import { TestBed } from '@angular/core/testing';

import { EdgeBorder1Service } from './edge-border1.service';

describe('EdgeBorder1Service', () => {
  let service: EdgeBorder1Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EdgeBorder1Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
