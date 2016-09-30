import { Component, Input, OnInit, OnDestroy } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

import { Team } from '../../../common/team';
import { Location, TeamUpdate, TeamStatus } from '../../../common/update';
import { Racer } from '../../../common/racer';
import { DataService } from '../../data.service';

import { OrderBy } from '../../orderBy.pipe.ts';

@Component({
  selector: 'team-card',
  templateUrl: './team-card.template.html',
  styleUrls: ['./team-card.styles.scss'],
  pipes: [OrderBy]
})
export class TeamCardComponent implements OnInit, OnDestroy {
  team: Team;
  paramsSub: any;

  constructor(
    private dataService: DataService,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    this.paramsSub = this.activatedRoute.params.subscribe(params => {
      this.dataService.getTeam(params['id'])
        .then(team => this.team = team)
    }, 10);
  }

  ngOnDestroy() {
    this.paramsSub.unsubscribe();
  }

  updateTeam() {
    this.dataService.updateTeam(this.team);
  }
}
