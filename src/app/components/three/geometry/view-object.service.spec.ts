import { TestBed } from '@angular/core/testing';

import { ViewObjectService } from './view-object.service';

describe('ViewObjectService', () => {
  let service: ViewObjectService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ViewObjectService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
