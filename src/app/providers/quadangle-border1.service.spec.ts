import { TestBed } from '@angular/core/testing';

import { QuadangleBorder1Service } from './quadangle-border1.service';

describe('QuadangleBorder1Service', () => {
  let service: QuadangleBorder1Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QuadangleBorder1Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
