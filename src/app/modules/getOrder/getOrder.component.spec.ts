/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { GetOrderComponent } from './getOrder.component';

describe('GetOrderComponent', () => {
  let component: GetOrderComponent;
  let fixture: ComponentFixture<GetOrderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GetOrderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GetOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
