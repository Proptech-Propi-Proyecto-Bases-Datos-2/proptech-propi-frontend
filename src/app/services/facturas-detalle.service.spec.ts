import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { FacturasDetalleService } from './facturas-detalle.service';

describe('FacturasDetalleService', () => {
  let service: FacturasDetalleService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(FacturasDetalleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
