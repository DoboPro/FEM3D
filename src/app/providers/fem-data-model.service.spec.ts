import { TestBed } from '@angular/core/testing';

import { FemDataModelService } from './fem-data-model.service';

describe('FemDataModelService', () => {
  let service: FemDataModelService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FemDataModelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
