import { TestBed } from '@angular/core/testing';

import { RestraintService } from './restraint.service';

describe('RestraintService', () => {
  let service: RestraintService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RestraintService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
