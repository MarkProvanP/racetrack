import { Component, OnInit } from '@angular/core';
import { Router }            from '@angular/router';

import { Team }                from '../../common/team';
import { DataService }         from '../data.service';

@Component({
  selector: 'my-teams',
  templateUrl: './teams.component.html',
  styleUrls:  ['./teams.component.scss']
})
export class TeamsComponent implements OnInit {
  teams: Team[];
  selectedTeam: Team;

  constructor(
    private dataService: DataService,
    private router: Router) { }

  getTeams(): void {
    this.dataService
        .getTeams()
        .then(teams => this.teams = teams);
  }

  add(name: string): void {
    name = name.trim();
    if (!name) { return; }
    let properties = {name: name};
    this.dataService.createTeam(properties)
      .then(team => {
        this.teams.push(team);
        this.selectedTeam = null;
      });
  }

  delete(team: Team): void {
    this.dataService
        .deleteTeam(team.id)
        .then(() => {
          this.teams = this.teams.filter(h => h !== team);
          if (this.selectedTeam === team) { this.selectedTeam = null; }
        });
  }

  ngOnInit(): void {
    this.getTeams();
  }

  onSelect(team: Team): void {
    this.selectedTeam = team;
  }

  gotoDetail(): void {
    this.router.navigate(['/team', this.selectedTeam.id]);
  }
}


/*
Copyright 2016 Google Inc. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at http://angular.io/license
*/
