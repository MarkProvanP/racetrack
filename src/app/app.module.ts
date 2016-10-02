import "./rxjs-extensions";

import { NgModule, ApplicationRef } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
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
import { AppState } from './app.service';
import { Home } from './home';
import { About } from './about';
import { NoContent } from './no-content';

import { AllTextsComponent } from './texts/all-texts';
import { TeamTextsComponent } from './texts/team-texts';
import { RacerTextsComponent } from './texts/racer-texts';
import { TextsListComponent } from './texts/texts-list';
import { TextsComponent } from './texts';
import { RacersComponent } from './racers';
import { RacerDetailComponent } from './racer-detail';
import { RacerCardComponent } from './racers/racer-card';
import { TeamsComponent } from './teams';
import { TeamDetailComponent } from './team-detail';
import { TeamCardComponent } from './teams/team-card';
import { DashboardComponent } from './dashboard';
import { MapComponent } from './map';
import { NewUpdateComponent } from './updates/new-update';

import { DataService } from './data.service';
import { TextService } from './text.service';
import { OrderBy } from './orderBy.pipe';
import { KeysPipe } from './keys.pipe';

// Import diretives
import { XLarge } from './home/x-large';

// Application wide providers
const APP_PROVIDERS = [
  ...APP_RESOLVER_PROVIDERS,
  AppState,
  DataService,
  TextService
];

/**
 * `AppModule` is the main entry point into Angular2's bootstraping process
 */
@NgModule({
  bootstrap: [ App ],
  declarations: [
    App,
    About,
    Home,
    NoContent,
    XLarge,
    AllTextsComponent,
    TeamTextsComponent,
    RacerTextsComponent,
    TextsListComponent,
    TextsComponent,
    RacersComponent,
    RacerDetailComponent,
    RacerCardComponent,
    TeamsComponent,
    TeamDetailComponent,
    TeamCardComponent,
    DashboardComponent,
    MapComponent,
    NewUpdateComponent,
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
      apiKey: 'AIzaSyAffhQUtmEnMCrrFtdkXfW1eW8zU8MBonw'
    })
  ],
  providers: [ // expose our Services and Providers into Angular's dependency injection
    ENV_PROVIDERS,
    APP_PROVIDERS
  ]
})
export class AppModule {
  constructor(public appRef: ApplicationRef, public appState: AppState) {}
  hmrOnInit(store) {
    if (!store || !store.state) return;
    console.log('HMR store', store);
    this.appState._state = store.state;
    this.appRef.tick();
    delete store.state;
  }
  hmrOnDestroy(store) {
    var cmpLocation = this.appRef.components.map(cmp => cmp.location.nativeElement);
    // recreate elements
    var state = this.appState._state;
    store.state = state;
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
