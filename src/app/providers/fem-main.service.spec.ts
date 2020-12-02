import { TestBed } from '@angular/core/testing';

import { FemMainService } from './fem-main.service';

describe('FemMainService', () => {
  let service: FemMainService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FemMainService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
