import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CadInquilino } from './cad-inquilino';

describe('CadInquilino', () => {
  let component: CadInquilino;
  let fixture: ComponentFixture<CadInquilino>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CadInquilino]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CadInquilino);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
