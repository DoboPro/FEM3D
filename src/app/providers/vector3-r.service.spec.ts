import { TestBed } from '@angular/core/testing';

import { Vector3RService } from './vector3-r.service';

describe('Vector3RService', () => {
  let service: Vector3RService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Vector3RService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
