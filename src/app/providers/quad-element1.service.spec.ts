import { TestBed } from '@angular/core/testing';

import { QuadElement1Service } from './quad-element1.service';

describe('QuadElement1Service', () => {
  let service: QuadElement1Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QuadElement1Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
