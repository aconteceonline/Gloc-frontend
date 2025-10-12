import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Menucadastrar } from './menucadastrar';

describe('Menucadastrar', () => {
  let component: Menucadastrar;
  let fixture: ComponentFixture<Menucadastrar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Menucadastrar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Menucadastrar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
