import { TestBed } from '@angular/core/testing';

import { Gift } from './gift';

describe('Gift', () => {
  let service: Gift;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Gift);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
