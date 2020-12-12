import { TestBed } from '@angular/core/testing';

import { Solver } from './solver.service';

describe('Solver', () => {
  let service: Solver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Solver);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
