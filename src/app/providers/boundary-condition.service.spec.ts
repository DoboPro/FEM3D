import { TestBed } from '@angular/core/testing';

import { BoundaryConditionService } from './boundary-condition.service';

describe('BoundaryConditionService', () => {
  let service: BoundaryConditionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BoundaryConditionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
