import { Routes, RouterModule } from '@angular/router';

import { TextsComponent } from './texts';
import { AllTextsComponent } from './texts/all-texts';
import { RacerTextsComponent } from './texts/racer-texts';
import { TeamTextsComponent } from './texts/team-texts';

import { RacersComponent } from './racers';
import { TeamsComponent } from './teams';
import { DashboardComponent } from './dashboard';
import { RacerCardComponent } from './racers/racer-card';
import { TeamCardComponent } from './teams/team-card';
import { MapComponent } from './map';
import { DataResolver } from './app.resolver';


export const ROUTES: Routes = [
  {
    path: 'texts',
    component: TextsComponent,
    children: [
      { path: '', redirectTo: 'all', pathMatch: 'full'},
      { 
        path: 'all',
        children: [
          { path: '', component: AllTextsComponent },
          { path: 'unread', component: AllTextsComponent }
        ]
      },
      {
        path: 'by-racer',
        children: [
          { path: '', component: RacerTextsComponent },
          { path: ':id', component: RacerTextsComponent }
        ]
      },
      { 
        path: 'by-team',
        children: [
          { path: '', component: TeamTextsComponent },
          { path: ':id', component: TeamTextsComponent }
        ]
      }
    ]
  },
  {
    path: 'racers',
    component: RacersComponent,
    children: [
      { path: '' },
      { path: ':id', component: RacerCardComponent },
      { path: ':id/edit', component: RacerCardComponent }
    ]
  },
  {
    path: 'teams',
    component: TeamsComponent,
    children: [
      { path: '' },
      { path: ':id', component: TeamCardComponent },
      { path: ':id/edit', component: TeamCardComponent }
    ]
  },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'map', component: MapComponent },
  { path: '**', component: DashboardComponent }
];
