import { TestBed } from '@angular/core/testing';

import { ComparisonServices } from './comparison-services';

describe('ComparisonServices', () => {
  let service: ComparisonServices;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ComparisonServices);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
