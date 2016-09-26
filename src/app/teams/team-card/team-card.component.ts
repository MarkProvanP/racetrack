import { Component, Input } from "@angular/core";

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
export class TeamCardComponent {
  @Input() team: Team;

  constructor(
    private dataService: DataService
  ) {}
}
