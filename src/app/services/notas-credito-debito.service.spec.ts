import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NotasCreditoDebitoService } from './notas-credito-debito.service';

describe('NotasCreditoDebitoService', () => {
  let service: NotasCreditoDebitoService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(NotasCreditoDebitoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
