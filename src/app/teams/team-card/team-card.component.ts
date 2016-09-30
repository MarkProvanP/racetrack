import { Component, Input, OnInit, OnDestroy } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";

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
  routeSub: any;
  inEditMode: boolean = false;

  constructor(
    private dataService: DataService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.paramsSub = this.activatedRoute.params.subscribe(params => {
      this.dataService.getTeam(params['id'])
        .then(team => this.team = team)
    }, 10);
    this.routeSub = this.activatedRoute.url.subscribe(urlSegments => {
      this.inEditMode = (urlSegments[urlSegments.length - 1].path == 'edit');
    });
  }

  ngOnDestroy() {
    this.paramsSub.unsubscribe();
  }

  editTeam() {
    this.router.navigate(['/teams', this.team.id, 'edit']);
  }

  saveTeam() {
    this.dataService.updateTeam(this.team)
      .then(team =>  {
        this.router.navigate(['/teams', team.id]);
      });
  }

  updateTeam() {
    this.dataService.updateTeam(this.team);
  }

  deleteTeam() {
    this.dataService.deleteTeam(this.team.id);
  }
}
