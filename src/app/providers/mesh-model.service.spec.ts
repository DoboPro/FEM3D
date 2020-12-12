import { TestBed } from '@angular/core/testing';

import { MeshModel } from './mesh-model.service';

describe('MeshModel', () => {
  let service: MeshModel;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MeshModel);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
