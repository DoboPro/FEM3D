import { TestBed } from '@angular/core/testing';

import { FENodeService } from './fenode.service';

describe('FENodeService', () => {
  let service: FENodeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FENodeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
