import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";

import { UserService } from "../user.service";
import { DataService } from "../data.service";

import { Team } from "../../common/team";
import { TeamUpdate, TeamStatus, prettyStatusName } from "../../common/update";

@Component({
  selector: 'updates',
  templateUrl: './updates.component.html',
  styleUrls: ['./updates.component.scss']
})
export class UpdatesComponent implements OnInit {
  teams: Team[];
  selectedTeam: Team
  inCreateUpdateMode: boolean = false;
  statusEnum = TeamStatus;
  paramsSub: any;

  editingUpdate: TeamUpdate;

  default = {
    zoom: 6
  }

  constructor(
    private dataService: DataService,
    private userService: UserService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {}

  routeToTeam(team: Team) {
    this.router.navigate(['/safetyteam', 'updates', team.id]);
  }

  selectUpdatesByTeam(team: Team) {
    this.selectedTeam = team;
    console.log(this.selectedTeam);
  }

  getPrettyStatusName(item) {
    return prettyStatusName(item.key);
  }

  createNewUpdate() {
    this.inCreateUpdateMode = true;
  }

  onUpdateCreated() {
    this.inCreateUpdateMode = false;
  }

  editUpdate(update: TeamUpdate) {
    this.editingUpdate = update;
  }

  saveUpdate(update: TeamUpdate) {
    this.editingUpdate.byUser = this.userService.getUserAction();
    this.dataService.updateTeamUpdate(this.editingUpdate)
    .then(r => {
      this.editingUpdate = undefined;
    })
  }

  isEditing(update: TeamUpdate) {
    return update == this.editingUpdate;
  }

  ngOnInit() {
    this.dataService.getTeams()
    .then(teams => {
      this.teams = teams;
      this.paramsSub = this.activatedRoute.params.subscribe(params => {
        let team = this.teams.filter(team => team.id == params['id'])[0]
        this.selectUpdatesByTeam(team);
      });
    })
  }

  onMarkerDragEnd(event) {
    this.editingUpdate.location.latitude = event.coords.lat;
    this.editingUpdate.location.longitude = event.coords.lng;
  }
}
