import { Component, OnInit, Pipe } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Router } from '@angular/router';

import { Team, Location, TeamUpdate, TeamStatus } from '../../common/team';
import { Racer } from '../../common/racer';
import { DataService } from '../data.service';

// From stackoverflow
// http://stackoverflow.com/a/35750252
@Pipe({name: 'keys'})
export class KeysPipe implements PipeTransform {
  transform(value, args:string[]) : any {
    let keys = [];
    for (var enumMember in value) {
      var isValueProperty = parseInt(enumMember, 10) >= 0
      if (isValueProperty) {
        keys.push({key: enumMember, value: value[enumMember]});
        // Uncomment if you want log
        // console.log("enum member: ", value[enumMember]);
      } 
    }
    return keys;
  }
}

@Component({
  pipes: [KeysPipe],
  selector: 'my-team-detail',
  templateUrl: './team-detail.component.html',
  styleUrls: ['./team-detail.component.scss']
})
export class TeamDetailComponent implements OnInit {
  team: Team;

  statusEnum = TeamStatus;

  constructor(
    private dataService: DataService,
    private route: ActivatedRoute,
    private router: Router) {}

  ngOnInit(): void {
    this.route.params.forEach((params: Params) => {
      let id = +params['id'];
      this.dataService.getTeam(id)
        .then(team => {
          this.team = team;
        });
    });
  }

  inNewStatusMode: false;
  newStatusObj = {};

  createStatusUpdate(): void {
    this.inNewStatusMode = true; 
    this.newStatusObj = {
      location: new Location;
    }
  }

  saveNewStatus(): void {
    this.dataService.createStatusUpdateForTeam(this.newStatusObj, this.team)
      .then(team => this.team = team);
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
