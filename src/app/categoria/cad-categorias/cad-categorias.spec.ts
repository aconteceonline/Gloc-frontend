import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CadCategorias } from './cad-categorias';

describe('CadCategorias', () => {
  let component: CadCategorias;
  let fixture: ComponentFixture<CadCategorias>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CadCategorias]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CadCategorias);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
