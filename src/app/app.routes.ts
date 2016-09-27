import { Routes, RouterModule } from '@angular/router';
import { Home } from './home';
import { About } from './about';
import { NoContent } from './no-content';

import { TextsComponent } from './texts';
import { AllTextsComponent } from './texts/all-texts';
import { RacerTextsComponent } from './texts/racer-texts';
import { TeamTextsComponent } from './texts/team-texts';

import { RacersComponent } from './racers';
import { TeamsComponent } from './teams';
import { DashboardComponent } from './dashboard';
import { RacerDetailComponent } from './racer-detail';
import { TeamDetailComponent } from './team-detail';
import { TeamCardComponent } from './teams/team-card';

import { DataResolver } from './app.resolver';


export const ROUTES: Routes = [
  { path: '',      component: DashboardComponent },
  { path: 'home',  component: Home },
  { path: 'about', component: About },
  {
    path: 'texts',
    component: TextsComponent,
    children: [
      { path: '', redirectTo: 'all', pathMatch: 'full'},
      { path: 'all', component: AllTextsComponent },
      { path: 'by-racer', component: RacerTextsComponent },
      { path: 'by-team', component: TeamTextsComponent }
    ]
  },
  { path: 'racers', component: RacersComponent },
  {
    path: 'teams',
    component: TeamsComponent,
    children: [
      { path: '' },
      { path: ':id', component: TeamCardComponent }
    ]
  },
  { path: 'racer/:id', component: RacerDetailComponent },
  { path: 'team/:id', component: TeamDetailComponent },
  {
    path: 'detail', loadChildren: () => System.import('./+detail')
  },
  { path: 'dashboard', component: DashboardComponent },
  { path: '**',    component: NoContent },
];
