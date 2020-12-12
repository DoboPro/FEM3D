import { TestBed } from '@angular/core/testing';

import { SymmetricTensor3Service } from './symmetric-tensor3.service';

describe('SymmetricTensor3Service', () => {
  let service: SymmetricTensor3Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SymmetricTensor3Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
