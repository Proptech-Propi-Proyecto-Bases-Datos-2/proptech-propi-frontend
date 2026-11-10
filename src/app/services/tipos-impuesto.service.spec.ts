import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TiposImpuestoService } from './tipos-impuesto.service';

describe('TiposImpuestoService', () => {
  let service: TiposImpuestoService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(TiposImpuestoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
