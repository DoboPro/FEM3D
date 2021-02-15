import { TestBed } from '@angular/core/testing';

import { FemObjectService } from './fem-object.service';

describe('FemObjectService', () => {
  let service: FemObjectService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FemObjectService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
