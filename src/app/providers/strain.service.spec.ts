import { TestBed } from '@angular/core/testing';

import { StrainService } from './strain.service';

describe('StrainService', () => {
  let service: StrainService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StrainService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
