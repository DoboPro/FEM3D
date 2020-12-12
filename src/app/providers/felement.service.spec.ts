import { TestBed } from '@angular/core/testing';

import { FElementService } from './felement.service';

describe('FElementService', () => {
  let service: FElementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FElementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
