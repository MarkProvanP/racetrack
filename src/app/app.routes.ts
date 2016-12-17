import { Routes, RouterModule } from '@angular/router';

import { TextsComponent } from './texts';
import { AllTextsComponent } from './texts/all-texts';
import { RacerTextsComponent } from './texts/racer-texts';
import { TeamTextsComponent } from './texts/team-texts';

import { RacersComponent } from './racers';
import { TeamsComponent } from './teams';
import { DashboardComponent } from './dashboard';
import { RacerCardComponent } from './racers/racer-card';
import { NoRacerComponent } from './racers/no-racer';
import { TeamCardComponent } from './teams/team-card';
import { NoTeamComponent } from './teams/no-team';
import { PublicMapComponent } from './public-map';
import { PublicTeamProgressMapComponent } from './public-team-progress-map';
import { MassTextComponent } from './mass-text';
import { ImportComponent } from "./import";
import { SafetyMapComponent } from './safety-map';
import { DataResolver } from './app.resolver';
import { UpdatesComponent } from './updates';

import { LoginComponent } from './user/login';
import { LogoutComponent } from './user/logout';
import { MeComponent } from './user/me';
import { RegisterComponent } from './user/register';
import { UserListComponent } from "./user/list";

import { PrivateApp } from "./private-app";
import { PublicApp } from "./public-app"

import { AuthenticatedGuard, UnauthenticatedGuard } from './guards';

export const ROUTES: Routes = [
  {
    path: 'safetyteam',
    component: PrivateApp,
    canActivate: [AuthenticatedGuard],
    children: [
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
          { path: '', component: NoRacerComponent },
          { path: ':id', component: RacerCardComponent },
          { path: ':id/edit', component: RacerCardComponent }
        ]
      },
      {
        path: 'teams',
        component: TeamsComponent,
        children: [
          { path: '', component: NoTeamComponent },
          { path: ':id', component: TeamCardComponent },
          { path: ':id/edit', component: TeamCardComponent }
        ]
      },
      {
        path: 'updates',
        children: [
          { path: '', component: UpdatesComponent },
          { path: ':id', component: UpdatesComponent }
        ]
      },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'map', component: SafetyMapComponent },
      {
        path: 'user', children: [
          { path: 'logout', component: LogoutComponent },
          { path: 'me', component: MeComponent },
          { path: 'list', component: UserListComponent }
        ]
      },
      { path: 'mass-text', component: MassTextComponent },
      { path: 'import', component: ImportComponent },
      { path: '', redirectTo: '/safetyteam/dashboard' }
    ]
  },
  {
    path: '',
    component: PublicApp,
    canActivate: [UnauthenticatedGuard],
    children: [
      { path: 'login', component: LoginComponent,},
      { path: 'register', component: RegisterComponent },
      { path: 'team-progress/:id', component: PublicTeamProgressMapComponent },
      { path: '**', component: PublicMapComponent }
    ]
  }
];
