import { Routes, RouterModule } from '@angular/router';
import { Home } from './home';
import { About } from './about';
import { NoContent } from './no-content';

import { RacersComponent } from './racers';
import { TeamsComponent } from './teams';
import { DashboardComponent } from './dashboard';
import { RacerDetailComponent } from './racer-detail';
import { TeamDetailComponent } from './team-detail';

import { DataResolver } from './app.resolver';


export const ROUTES: Routes = [
  { path: '',      component: DashboardComponent },
  { path: 'home',  component: Home },
  { path: 'about', component: About },
  { path: 'racers', component: RacersComponent },
  { path: 'teams', component: TeamsComponent },
  { path: 'racer/:id', component: RacerDetailComponent },
  { path: 'team/:id', component: TeamDetailComponent },
  {
    path: 'detail', loadChildren: () => System.import('./+detail')
  },
  { path: 'dashboard', component: DashboardComponent },
  { path: '**',    component: NoContent },
];
