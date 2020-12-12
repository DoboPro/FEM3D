import { TestBed } from '@angular/core/testing';

import { FileIO } from './file-io.service';

describe('FileIO', () => {
  let service: FileIO;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FileIO);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
