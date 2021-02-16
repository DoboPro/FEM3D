import { TestBed } from '@angular/core/testing';

import { PlaneService } from './plane.service';

describe('PlaneService', () => {
  let service: PlaneService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlaneService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
