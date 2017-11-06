import * as moment from "moment";

import { Component, Input, OnInit, OnDestroy } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";

import { Team, TeamId } from '../../../common/team';
import { Location, TeamUpdate, TeamStatus } from '../../../common/update';
import { Racer } from '../../../common/racer';
import { UserService } from "../../user.service";
import { DataService } from '../../data.service';

const ALLOWED_CHECKIN_DURATION = moment.duration(3, 'hours');

@Component({
  selector: 'team-card',
  templateUrl: './team-card.component.pug',
  styleUrls: ['./team-card.component.scss']
})
export class TeamCardComponent implements OnInit, OnDestroy {
  id: TeamId;
  team: Team;
  paramsSub: any;
  routeSub: any;
  inEditMode: boolean = false;
  inAddingRacerMode: boolean = false;
  unteamedRacers: Racer[] = [];
  unteamedMatchingRacers: Racer[] = [];
  addRacerFilterName: string;

  inNewUpdateMode: boolean = false;
  newStatusObj = {};

  constructor(
    private userService: UserService,
    private dataService: DataService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {
    this.dataService.addTeamsChangedListener(teams => {
      this.getTeam();
    })
  }

  randomColor() {
    this.team.color = '#FFF'
  }

  getTeam() {
    this.team = this.dataService.getTeam(this.id);
  }

  teamHasCheckedIn() {
    return this.team.lastCheckin && this.team.lastCheckin.byUser;
  }

  ngOnInit() {
    this.paramsSub = this.activatedRoute.params.subscribe(params => {
      this.id = params['id'];
      this.getTeam();
    });
    this.routeSub = this.activatedRoute.url.subscribe(urlSegments => {
      this.inEditMode = (urlSegments[urlSegments.length - 1].path == 'edit');
      if (this.inEditMode) {
        this.updateUnteamedRacers();
      }
    });
  }

  updateUnteamedRacers() {
    this.dataService.getRacersWithoutTeams()
      .then(racers => {
        this.unteamedRacers = racers;
      });
  }

  ngOnDestroy() {
    this.paramsSub.unsubscribe();
  }

  editTeam() {
    this.router.navigate(['/safetyteam', 'teams', this.team.id, 'edit']);
  }

  saveTeam() {
    this.updateTeam()
      .then(team =>  {
        this.router.navigate(['/safetyteam', 'teams', team.id]);
      });
  }

  updateTeam() {
    return this.dataService.updateTeamAndWriteToBackend(this.team);
  }

  deleteTeam() {
    this.dataService.deleteTeam(this.team.id);
  }

  addRacer() {
    this.inAddingRacerMode = true;
    this.updateUnteamedRacers();
  }

  addSpecificRacer(racer: Racer) {
    this.team.racers.push(racer);
    this.inAddingRacerMode = false;
    this.updateTeam()
    this.updateUnteamedRacers();
  }

  filterAddRacers() {
    let name = this.addRacerFilterName;
    this.unteamedMatchingRacers = this.unteamedRacers
      .filter(racer => racer.name.indexOf(name) != -1);
  }

  removeRacer(racer: Racer) {
    let index = this.team.racers.indexOf(racer);
    if (index > -1) {
      this.team.racers.splice(index, 1);
    }
    this.updateTeam();
    this.updateUnteamedRacers();
  }

  noUnteamedRacers() {
    return this.unteamedRacers.length == 0;
  }

  createNewUpdate() {
    this.inNewUpdateMode = true;
    this.newStatusObj = {
      location: new Location()
    }
  }

  deleteUpdate(update: TeamUpdate) {
    let index = this.team.statusUpdates.indexOf(update);
    if (index > -1) {
      this.team.statusUpdates.splice(index, 1);
    }
    this.dataService.updateTeamAndWriteToBackend(this.team)
  }

  onStatusCreated() {
    this.inNewUpdateMode = false;
  }

  goToTeamTexts(team: Team) {
    this.router.navigate(['/safetyteam', 'texts', 'by-team', team.id]);
  }

  addCheckin() {
    this.team.lastCheckin = {
      checkinTime: new Date(),
      byUser: this.userService.getUserAction()
    }
    this.dataService.updateTeamAndWriteToBackend(this.team)
  }

  clearCheckin() {
    this.team.lastCheckin = null;
    this.dataService.updateTeamAndWriteToBackend(this.team)
  }

  checkinProgressBarColor() {
    let ratio = this.checkinProgressBarValue();
    if (ratio < 100) {
      return 'accent'
    } else {
      return 'warn'
    }
  }

  getOverdueTime() {
    let now = moment();
    let lastCheckinTime = moment(this.team.lastCheckin.checkinTime);
    let duration = moment.duration(now.diff(lastCheckinTime));
    let overdue = duration.subtract(ALLOWED_CHECKIN_DURATION);
    if (overdue.asSeconds() > 0) return overdue;
  }

  checkinProgressBarTitle() {
    let now = moment();
    let lastCheckinTime = moment(this.team.lastCheckin.checkinTime);
    let duration = moment.duration(now.diff(lastCheckinTime));
    return `Last checked in ${duration.humanize()} ago, allowed ${ALLOWED_CHECKIN_DURATION.humanize()}`
  }

  checkinProgressBarValue() {
    let now = moment();
    let lastCheckinTime = moment(this.team.lastCheckin.checkinTime);
    let duration = moment.duration(now.diff(lastCheckinTime));
    let durationSeconds = duration.asSeconds();
    let allowedSeconds = ALLOWED_CHECKIN_DURATION.asSeconds();
    let ratio = durationSeconds/allowedSeconds;
    return Math.round(ratio * 100);
  }
}
