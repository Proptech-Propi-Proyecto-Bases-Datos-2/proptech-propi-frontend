import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotaCreditoDebito } from './nota-credito-debito';

describe('NotaCreditoDebito', () => {
  let component: NotaCreditoDebito;
  let fixture: ComponentFixture<NotaCreditoDebito>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotaCreditoDebito],
    }).compileComponents();

    fixture = TestBed.createComponent(NotaCreditoDebito);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
