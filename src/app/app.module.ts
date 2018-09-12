import { NgModule, ApplicationRef } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
//import { TranslateService } from '@ngx-translate/core';
import { CommonHttpService } from './services/common.http.service';


/*
 * Platform and Environment providers/directives/pipes
 */
import { routing } from './app.routing';

// App is our top level component
import { App } from './app.component';
import { AppState, InternalStateType } from './app.service';
import { GlobalState } from './global.state';
import { NgaModule } from './theme/nga.module';
import { PagesModule } from './pages/pages.module';

import { LoginModule } from './core/login/login.module';

import { LocationService }    from './services/location.service';
import { UserService }        from './services/user.service';
import { AuthService }        from './services/auth.service';
import { AuthGuard }        from './services/auth-guard.service';

//declare var require: any;

// Application wide providers
const APP_PROVIDERS = [
  AppState,
  GlobalState,
  LocationService,
  UserService,
  AuthService,
  AuthGuard,
  CommonHttpService
];

export type StoreType = {
  state: InternalStateType,
  restoreInputValues: () => void,
  disposeOldHosts: () => void
};

/**
 * `AppModule` is the main entry point into Angular2's bootstraping process
 */
@NgModule({
  bootstrap: [App],
  declarations: [
    App
  ],
  imports: [ // import Angular's modules
    BrowserModule,
    BrowserAnimationsModule,
    HttpModule,
    HttpClientModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    NgaModule.forRoot(),
    NgbModule.forRoot(),
    PagesModule,
    LoginModule,
    routing
  ],
  /*
  providers: [ // expose our Services and Providers into Angular's dependency injection
    ...APP_PROVIDERS
  ]//*/
  providers: APP_PROVIDERS
})

export class AppModule {

  constructor(public appState: AppState) {
  }
}
