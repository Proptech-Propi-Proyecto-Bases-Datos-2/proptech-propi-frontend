import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ProductosServiciosService } from './productos-servicios.service';

describe('ProductosServiciosService', () => {
  let service: ProductosServiciosService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ProductosServiciosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
