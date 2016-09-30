import { Component, OnInit } from '@angular/core';
import { Router }            from '@angular/router';

import { Team }                from '../../common/team';
import { DataService }         from '../data.service';

import { MdIcon, MdIconRegistry } from "@angular2-material/icon";

@Component({
  selector: 'my-teams',
  templateUrl: './teams.template.html',
  styleUrls:  ['./teams.styles.scss'],
  directives: [MdIcon],
  viewProviders: [MdIconRegistry]
})
export class TeamsComponent implements OnInit {
  teams: Team[];

  constructor(
    private dataService: DataService,
    private router: Router) { }

  onSelect(team: Team) {
    this.router.navigate(['/teams', team.id]);
  }

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
        this.router.navigate(['/team']);
      });
  }

  delete(team: Team): void {
    this.dataService
        .deleteTeam(team.id)
        .then(() => {
          this.teams = this.teams.filter(h => h !== team);
          if (this.router.url.split("/").pop() == team.id) { this.router.navigate(['/team']) }
        });
  }

  ngOnInit(): void {
    this.getTeams();
  }

  gotoDetail(team): void {
    this.router.navigate(['/team', team.id]);
  }

  createTeam() {
    this.dataService.createTeam({})
      .then(team => {
        this.getTeams();
        this.router.navigate(['/teams', team.id, 'edit']);
      })
  }
}


/*
Copyright 2016 Google Inc. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at http://angular.io/license
*/
