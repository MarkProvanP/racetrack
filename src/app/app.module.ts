import "./rxjs-extensions";

import { MaterialModule } from "@angular/material";

import { NgModule, ApplicationRef } from '@angular/core';
import { Title, BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { APP_RESOLVER_PROVIDERS } from './app.resolver';

import { PrivateApp } from "./private-app"
import { PublicApp } from './public-app';

import { AllTextsComponent } from './texts/all-texts';
import { TeamTextsComponent } from './texts/team-texts';
import { RacerTextsComponent } from './texts/racer-texts';
import { TextsListComponent } from './texts/texts-list';
import { TextsComponent } from './texts';
import { RacersComponent } from './racers';
import { RacerCardComponent } from './racers/racer-card';
import { NoRacerComponent } from './racers/no-racer';
import { TeamsComponent } from './teams';
import { TeamCardComponent } from './teams/team-card';
import { NoTeamComponent } from './teams/no-team';
import { DashboardComponent } from './dashboard';
import { DashboardCardComponent } from './dashboard/dashboard-card';
import { SafetyMapComponent } from './safety-map';
import { PublicMapComponent } from './public-map';
import { PublicTeamProgressMapComponent } from './public-team-progress-map';
import { NewUpdateComponent } from './updates/new-update';
import { TextSendComponent } from './texts/text-send';
import { NormalTextComponent } from './texts/texts-list/normal-text';
import { AppTextComponent } from './texts/texts-list/app-text';
import { SentTextComponent } from './texts/texts-list/sent-text';
import { UnknownTextComponent } from './texts/texts-list/unknown-text';
import { MassTextComponent } from './mass-text';

import { LoginComponent } from './user/login';
import { LogoutComponent } from './user/logout';
import { MeComponent } from './user/me';
import { RegisterComponent } from './user/register';

import { TimeWidget } from "./widgets/time";
import { LocationWidget } from "./widgets/location";

import { DataService } from './data.service';
import { TextService } from './text.service';
import { UserService } from './user.service';

import {
  OrderByPipe,
  KeysPipe,
  TeamHasUpdatePipe
} from "./pipes";

import { AuthenticatedGuard, UnauthenticatedGuard } from './guards';

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
    PublicApp,
    PrivateApp,
    AllTextsComponent,
    TeamTextsComponent,
    RacerTextsComponent,
    TextsListComponent,
    TextsComponent,
    RacersComponent,
    RacerCardComponent,
    NoRacerComponent,
    TeamsComponent,
    TeamCardComponent,
    NoTeamComponent,
    DashboardComponent,
    DashboardCardComponent,
    PublicMapComponent,
    PublicTeamProgressMapComponent,
    SafetyMapComponent,
    NewUpdateComponent,
    TextSendComponent,
    NormalTextComponent,
    AppTextComponent,
    SentTextComponent,
    UnknownTextComponent,
    MassTextComponent,
    LoginComponent,
    LogoutComponent,
    MeComponent,
    RegisterComponent,
    // WIDGETS
    TimeWidget,
    LocationWidget,
    // PIPES
    OrderByPipe,
    TeamHasUpdatePipe,
    KeysPipe
  ],
  imports: [ // import Angular's modules
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    RouterModule.forRoot(ROUTES, { useHash: true }),
    MaterialModule.forRoot(),
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
    
