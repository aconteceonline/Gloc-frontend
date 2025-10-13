import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Menuconsultar } from './menuconsultar';

describe('Menuconsultar', () => {
  let component: Menuconsultar;
  let fixture: ComponentFixture<Menuconsultar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Menuconsultar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Menuconsultar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
