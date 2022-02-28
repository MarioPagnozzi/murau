import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputFilePhotosComponent } from './input-file-photos.component';

describe('InputFilePhotosComponent', () => {
  let component: InputFilePhotosComponent;
  let fixture: ComponentFixture<InputFilePhotosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InputFilePhotosComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InputFilePhotosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
