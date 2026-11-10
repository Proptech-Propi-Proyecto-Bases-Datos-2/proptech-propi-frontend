import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductoServicio } from './producto-servicio';

describe('ProductoServicio', () => {
  let component: ProductoServicio;
  let fixture: ComponentFixture<ProductoServicio>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductoServicio],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductoServicio);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
