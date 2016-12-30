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
  }

  createTeam() {
    let id = prompt("Enter ID");
    if (!id) {
      return;
    }
    let name = prompt("Enter name");
    if (!name) {
      return;
    }
    let properties = { id, name };
    this.dataService.createTeam(properties)
      .then(team => {
        this.getTeams();
        this.router.navigate(['/safetyteam', 'teams', team.id, 'edit']);
      })
  }
}
