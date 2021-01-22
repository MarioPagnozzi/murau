import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashbordPrincipalComponent } from './dashbord-principal.component';

describe('DashbordPrincipalComponent', () => {
  let component: DashbordPrincipalComponent;
  let fixture: ComponentFixture<DashbordPrincipalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashbordPrincipalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DashbordPrincipalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
