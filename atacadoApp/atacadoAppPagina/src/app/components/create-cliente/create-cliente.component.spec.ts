import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateClienteComponent } from './create-cliente.component';

describe('CreateClienteComponent', () => {
  let component: CreateClienteComponent;
  let fixture: ComponentFixture<CreateClienteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateClienteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateClienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
