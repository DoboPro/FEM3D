import { TestBed } from '@angular/core/testing';

import { FemDataModel } from './fem-data-model.service';

describe('FemDataModel', () => {
  let service: FemDataModel;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FemDataModel);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
