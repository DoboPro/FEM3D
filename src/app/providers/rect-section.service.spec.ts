import { TestBed } from '@angular/core/testing';

import { RectSectionService } from './rect-section.service';

describe('RectSectionService', () => {
  let service: RectSectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RectSectionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
