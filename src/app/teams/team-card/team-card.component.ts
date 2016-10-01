import { Component, Input, OnInit, OnDestroy, Pipe, PipeTransform } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";

import { Team } from '../../../common/team';
import { Location, TeamUpdate, TeamStatus } from '../../../common/update';
import { Racer } from '../../../common/racer';
import { DataService } from '../../data.service';

import { OrderBy } from '../../orderBy.pipe.ts';

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
  selector: 'team-card',
  templateUrl: './team-card.template.html',
  styleUrls: ['./team-card.styles.scss'],
  pipes: [OrderBy, KeysPipe]
})
export class TeamCardComponent implements OnInit, OnDestroy {
  team: Team;
  paramsSub: any;
  routeSub: any;
  inEditMode: boolean = false;
  inAddingRacerMode: boolean = false;
  unteamedRacers: Racer[] = [];
  unteamedMatchingRacers: Racer[] = [];
  addRacerFilterName: string;

  inNewUpdateMode: boolean = false;
  statusEnum = TeamStatus;
  newStatusObj = {};

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
      if (this.inEditMode) {
        this.updateUnteamedRacers();
      }
    });
  }

  createNewUpdate() {
    
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
      location: new Location();
    }
  }

  saveNewUpdate() {
    this.dataService.createStatusUpdateForTeam(this.newStatusObj, this.team)
      .then(team => this.team = team);
    this.inNewUpdateMode = false;
  }

  goToTeamTexts(team: Team) {
    this.router.navigate(['/texts', 'by-team', team.id]);
  }
}
