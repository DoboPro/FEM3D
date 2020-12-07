import { TestBed } from '@angular/core/testing';

import { BoundsService } from './bounds.service';

describe('BoundsService', () => {
  let service: BoundsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BoundsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
