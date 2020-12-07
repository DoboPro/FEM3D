import { TestBed } from '@angular/core/testing';

import { FileIOService } from './file-io.service';

describe('FileIOService', () => {
  let service: FileIOService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FileIOService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
