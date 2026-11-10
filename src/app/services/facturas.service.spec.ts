import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { FacturasService } from './facturas.service';

describe('FacturasService', () => {
  let service: FacturasService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(FacturasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
