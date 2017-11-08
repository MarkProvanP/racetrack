import "./rxjs-extensions";


import { NgModule, ApplicationRef } from '@angular/core';
import { Title, BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';
import { removeNgStyles, createNewHosts } from '@angularclass/hmr';

import { BrowserAnimationsModule } from "@angular/platform-browser/animations"
import { AgmCoreModule } from "@agm/core";

import { RacetrackMaterialModule } from "./racetrack.material.module";
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
import { AddNonNativeTextComponent } from "./texts/non-native";
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
import { NewUpdateComponent } from './updates/new-update';
import { TextSendComponent } from './texts/text-send';
import { NormalTextComponent } from './texts/texts-list/normal-text';
import { AppTextComponent } from './texts/texts-list/app-text';
import { SentTextComponent } from './texts/texts-list/sent-text';
import { UnknownTextComponent } from './texts/texts-list/unknown-text';
import { NonNativeTextComponent } from "./texts/texts-list/non-native-text";
import { MassTextComponent } from './mass-text';
import { ImportComponent } from "./import";
import { UpdatesComponent } from "./updates";
import { DebugComponent } from "./misc/debug";

import { LoginComponent } from './user/login';
import { LogoutComponent } from './user/logout';
import { MeComponent } from './user/me';
import { SetPasswordComponent } from "./user/set-password";
import { UserListComponent } from "./user/list";

import { TimeWidget } from "./widgets/time";
import { LocationWidget } from "./widgets/location";
import { UserWidget } from "./widgets/user";
import { TextWidget } from "./widgets/text";
import { PhoneWidget } from "./widgets/phone";

import { DataService } from './data.service';
import { TextService } from './text.service';
import { UserService } from './user.service';
import { NominatimService } from "./nominatim.service";

import { PushNotificationsModule } from "angular2-notifications";

import {
  OrderByPipe,
  KeysPipe,
  TeamHasUpdatePipe
} from "./pipes";

import { AuthenticatedGuard, UnauthenticatedGuard, PasswordResetGuard } from './guards';

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

// Application wide providers
const APP_PROVIDERS = [
  ...APP_RESOLVER_PROVIDERS,
  DataService,
  TextService,
  UserService,
  NominatimService,
  AuthenticatedGuard,
  UnauthenticatedGuard,
  PasswordResetGuard,
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
    AddNonNativeTextComponent,
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
    SafetyMapComponent,
    NewUpdateComponent,
    TextSendComponent,
    NormalTextComponent,
    AppTextComponent,
    SentTextComponent,
    UnknownTextComponent,
    NonNativeTextComponent,
    MassTextComponent,
    ImportComponent,
    UpdatesComponent,
    DebugComponent,
    LoginComponent,
    LogoutComponent,
    MeComponent,
    SetPasswordComponent,
    UserListComponent,
    // WIDGETS
    TimeWidget,
    LocationWidget,
    UserWidget,
    TextWidget,
    PhoneWidget,
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
    RouterModule.forRoot(ROUTES, { useHash: false }),
    RacetrackMaterialModule,
    BrowserAnimationsModule,
    AgmCoreModule.forRoot({
      apiKey: GOOGLE_MAPS_API_KEY
    }),
    PushNotificationsModule
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
    
