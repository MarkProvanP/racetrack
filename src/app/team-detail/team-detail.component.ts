import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Router } from '@angular/router';

import { Team }        from '../../common/team';
import { Racer } from '../../common/racer';
import { DataService } from '../data.service';

@Component({
  selector: 'my-team-detail',
  templateUrl: './team-detail.component.html',
  styleUrls: ['./team-detail.component.scss']
})
export class TeamDetailComponent implements OnInit {
  team: Team;

  constructor(
    private dataService: DataService,
    private route: ActivatedRoute,
    private router: Router) {}

  ngOnInit(): void {
    this.route.params.forEach((params: Params) => {
      let id = +params['id'];
      this.dataService.getTeam(id)
        .then(team => this.team = team);
    });
  }

  save(): void {
    this.dataService.updateTeam(this.team)
      .then(this.goBack);
  }

  goBack(): void {
    window.history.back();
  }

  gotoRacerDetail(racer : Racer) {
    this.router.navigate(['/racer', racer.id]);
  }
}


/*
Copyright 2016 Google Inc. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at http://angular.io/license
*/
