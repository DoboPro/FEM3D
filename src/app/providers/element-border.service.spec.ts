import { TestBed } from '@angular/core/testing';

import { ElementBorderService } from './element-border.service';

describe('ElementBorderService', () => {
  let service: ElementBorderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ElementBorderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
