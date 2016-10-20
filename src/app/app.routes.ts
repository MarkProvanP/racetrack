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
import { PublicMapComponent } from './public-map';
import { SafetyMapComponent } from './safety-map';
import { DataResolver } from './app.resolver';

import { LoginComponent } from './user/login';
import { LogoutComponent } from './user/logout';
import { MeComponent } from './user/me';
import { RegisterComponent } from './user/register';

import { UnauthenticatedGuard } from './unauthenticated.guard';
import { AuthenticatedGuard } from './authenticated.guard';

export const ROUTES: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [UnauthenticatedGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [UnauthenticatedGuard] },
  { path: 'safetyteam', canActivate: [AuthenticatedGuard], children: [
    { path: '', redirectTo: 'dashboard' },
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
    { path: 'map', component: SafetyMapComponent },
    {
      path: 'user', children: [
        { path: 'logout', component: LogoutComponent, canActivate: [AuthenticatedGuard] },
        { path: 'me', component: MeComponent, canActivate: [AuthenticatedGuard] }
      ]
    },
  ] },
  { path: '**', component: PublicMapComponent },
];
