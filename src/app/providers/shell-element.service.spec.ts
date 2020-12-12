import { TestBed } from '@angular/core/testing';

import { ShellElementService } from './shell-element.service';

describe('ShellElementService', () => {
  let service: ShellElementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ShellElementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
