// import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { SiteDeploymentService } from './modules/providers/deployment';

describe('AppComponent', () => {
  let app: AppComponent;
  // let de: DebugElement;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent,
      ],
      imports: [RouterTestingModule, HttpClientModule],
      providers: [SiteDeploymentService],
    });

    fixture = TestBed.createComponent(AppComponent);
    app = fixture.componentInstance;
    // de = fixture.debugElement;
  });

  it('should create the app', () => {
    expect(app).toBeDefined();
  });
})
