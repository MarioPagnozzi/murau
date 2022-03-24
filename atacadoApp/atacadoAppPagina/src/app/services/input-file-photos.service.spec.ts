import { TestBed } from '@angular/core/testing';

import { InputFilePhotosService } from './input-file-photos.service';

describe('InputFilePhotosService', () => {
  let service: InputFilePhotosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InputFilePhotosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
