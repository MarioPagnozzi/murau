import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientesPendentesComponent } from './clientes-pendentes.component';

describe('ClientesPendentesComponent', () => {
  let component: ClientesPendentesComponent;
  let fixture: ComponentFixture<ClientesPendentesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClientesPendentesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientesPendentesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
