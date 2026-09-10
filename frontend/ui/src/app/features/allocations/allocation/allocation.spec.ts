import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Allocations } from './allocation';

describe('Allocation', () => {
  let component: Allocations;
  let fixture: ComponentFixture<Allocations>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Allocations]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Allocations);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
