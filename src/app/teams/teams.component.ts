import { Component, OnInit } from '@angular/core';
import { Router }            from '@angular/router';

import { Team }                from '../../common/team';
import { DataService }         from '../data.service';


@Component({
  selector: 'my-teams',
  templateUrl: './teams.component.pug',
  styleUrls:  ['./teams.component.scss']
})
export class TeamsComponent implements OnInit {
  teams: Team[];

  constructor(
    private dataService: DataService,
    private router: Router
  ) {
    this.dataService.addTeamsChangedListener(teams => this.teams = teams);
  }

  getTeamLink(team: Team) {
    return `/safetyteam/teams/${team.id}`;
  }

  getTeams() {
    this.teams = this.dataService.getAllTeams();
  }

  ngOnInit(): void {
    this.getTeams();
    console.log(this.teams);
  }

  createTeam() {
    this.dataService.createTeam({})
      .then(team => {
        this.getTeams();
        this.router.navigate(['/safetyteam', 'teams', team.id, 'edit']);
      })
  }
}


/*
Copyright 2016 Google Inc. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at http://angular.io/license
*/
