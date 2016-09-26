import { Component, Input } from "@angular/core";

import { Team } from '../../../common/team';
import { Location, TeamUpdate, TeamStatus } from '../../../common/update';
import { Racer } from '../../../common/racer';
import { DataService } from '../../data.service';

@Component({
  selector: 'team-card',
  templateUrl: './team-card.template.html',
  styleUrls: ['./team-card.styles.scss']
})
export class TeamCardComponent {
  @Input() team: Team;

  constructor(
    private dataService: DataService
  )
}
