import { TestBed } from '@angular/core/testing';

import { LoadObjectService } from './load-object.service';

describe('LoadObjectService', () => {
  let service: LoadObjectService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoadObjectService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
