import "./rxjs-extensions";

import { NgModule, ApplicationRef } from '@angular/core';
import { Title, BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';
import { removeNgStyles, createNewHosts } from '@angularclass/hmr';

import { AgmCoreModule } from "angular2-google-maps/core";
/*
 * Platform and Environment providers/directives/pipes
 */
import { ENV_PROVIDERS } from './environment';
import { ROUTES } from './app.routes';
// App is our top level component
import { App } from './app.component';
import { MdModule } from './md.module';
import { APP_RESOLVER_PROVIDERS } from './app.resolver';

import { AllTextsComponent } from './texts/all-texts';
import { TeamTextsComponent } from './texts/team-texts';
import { RacerTextsComponent } from './texts/racer-texts';
import { TextsListComponent } from './texts/texts-list';
import { TextsComponent } from './texts';
import { RacersComponent } from './racers';
import { RacerCardComponent } from './racers/racer-card';
import { TeamsComponent } from './teams';
import { TeamCardComponent } from './teams/team-card';
import { DashboardComponent } from './dashboard';
import { MapComponent } from './map';
import { NewUpdateComponent } from './updates/new-update';
import { TextSendComponent } from './texts/text-send';

import { LoginComponent } from './user/login';
import { LogoutComponent } from './user/logout';
import { MeComponent } from './user/me';
import { RegisterComponent } from './user/register';

import { DataService } from './data.service';
import { TextService } from './text.service';
import { UserService } from './user.service';
import { OrderBy } from './orderBy.pipe';
import { KeysPipe } from './keys.pipe';
import { UnauthenticatedGuard } from './unauthenticated.guard';
import { AuthenticatedGuard } from './authenticated.guard';

import * as config from "../../app-config";

// Application wide providers
const APP_PROVIDERS = [
  ...APP_RESOLVER_PROVIDERS,
  DataService,
  TextService,
  UserService,
  AuthenticatedGuard,
  UnauthenticatedGuard,
  Title
];

/**
 * `AppModule` is the main entry point into Angular2's bootstraping process
 */
@NgModule({
  bootstrap: [ App ],
  declarations: [
    App,
    AllTextsComponent,
    TeamTextsComponent,
    RacerTextsComponent,
    TextsListComponent,
    TextsComponent,
    RacersComponent,
    RacerCardComponent,
    TeamsComponent,
    TeamCardComponent,
    DashboardComponent,
    MapComponent,
    NewUpdateComponent,
    TextSendComponent,
    LoginComponent,
    LogoutComponent,
    MeComponent,
    RegisterComponent,
    OrderBy,
    KeysPipe
  ],
  imports: [ // import Angular's modules
    BrowserModule,
    FormsModule,
    HttpModule,
    RouterModule.forRoot(ROUTES, { useHash: true }),
    MdModule.forRoot(),
    AgmCoreModule.forRoot({
      apiKey: config.GoogleMapsAPIKey
    })
  ],
  providers: [ // expose our Services and Providers into Angular's dependency injection
    ENV_PROVIDERS,
    APP_PROVIDERS
  ]
})
export class AppModule {
  constructor(public appRef: ApplicationRef) {}
  hmrOnInit(store) {
    if (!store || !store.state) return;
    console.log('HMR store', store);
    this.appRef.tick();
    delete store.state;
  }
  hmrOnDestroy(store) {
    var cmpLocation = this.appRef.components.map(cmp => cmp.location.nativeElement);
    // recreate elements
    store.disposeOldHosts = createNewHosts(cmpLocation)
    // remove styles
    removeNgStyles();
  }
  hmrAfterDestroy(store) {
    // display new elements
    store.disposeOldHosts()
    delete store.disposeOldHosts;
  }
}
