import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TipoImpuesto } from './tipo-impuesto';

describe('TipoImpuesto', () => {
  let component: TipoImpuesto;
  let fixture: ComponentFixture<TipoImpuesto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TipoImpuesto],
    }).compileComponents();

    fixture = TestBed.createComponent(TipoImpuesto);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
