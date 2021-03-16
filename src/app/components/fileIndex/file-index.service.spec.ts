import { TestBed } from '@angular/core/testing';

import { FileIndexService } from './file-index.service';

describe('FileIndexService', () => {
  let service: FileIndexService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FileIndexService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
