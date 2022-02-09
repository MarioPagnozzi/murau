import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GridComponenteComponent } from './grid-componente.component';

describe('GridComponenteComponent', () => {
  let component: GridComponenteComponent;
  let fixture: ComponentFixture<GridComponenteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GridComponenteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GridComponenteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
