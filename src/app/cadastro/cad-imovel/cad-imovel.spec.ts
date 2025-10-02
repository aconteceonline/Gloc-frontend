import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CadImovel } from './cad-imovel';

describe('CadImovel', () => {
  let component: CadImovel;
  let fixture: ComponentFixture<CadImovel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CadImovel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CadImovel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
