import { TestBed } from '@angular/core/testing';

import { ShellParameterService } from './shell-parameter.service';

describe('ShellParameterService', () => {
  let service: ShellParameterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ShellParameterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
