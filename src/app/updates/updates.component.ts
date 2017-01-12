import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";

import { UserService } from "../user.service";
import { DataService } from "../data.service";
import { TextService, TextFilterOptions } from "../text.service";

import { Team } from "../../common/team";
import { Text, TextId } from "../../common/text";
import { TeamUpdate, TeamStatus, prettyStatusName } from "../../common/update";

@Component({
  selector: 'updates',
  templateUrl: './updates.component.pug',
  styleUrls: ['./updates.component.scss']
})
export class UpdatesComponent implements OnInit {
  teams: Team[] = [];
  selectedTeam: Team
  inCreateUpdateMode: boolean = false;
  statusEnum = TeamStatus;
  paramsSub: any;

  editingUpdate: TeamUpdate;
  linkedTextUpdate: TeamUpdate;
  loadedLinkedTexts = [];

  default = {
    zoom: 6
  }

  constructor(
    private dataService: DataService,
    private userService: UserService,
    private textService: TextService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {}

  routeToTeam(team: Team) {
    this.router.navigate(['/safetyteam', 'updates', team.id]);
  }

  getTeamLink(team: Team) {
    return `/safetyteam/updates/${team.id}`;
  }

  saveNotes() {
    this.dataService.updateTeamAndWriteToBackend(this.selectedTeam);
  }

  selectUpdatesByTeam(team: Team) {
    this.selectedTeam = team;
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
    this.dataService.getTeamsFromBackend()
    .then(teams => {
      this.teams = teams;
      this.paramsSub = this.activatedRoute.params.subscribe(params => {
        let team = this.teams.filter(team => team.id == params['id'])[0]
        this.selectUpdatesByTeam(team);
      });
    })
    this.paramsSub = this.activatedRoute.params.subscribe(params => {
      let team = this.teams.filter(team => team.id == params['id'])[0]
      this.selectUpdatesByTeam(team);
    });
  }

  onMarkerDragEnd(event) {
    this.editingUpdate.location.latitude = event.coords.lat;
    this.editingUpdate.location.longitude = event.coords.lng;
  }

  showingLinkedTextsForUpdate(update: TeamUpdate) {
    return update == this.linkedTextUpdate;
  }

  loadLinkedTextsForUpdate(update: TeamUpdate) {
    this.loadedLinkedTexts = [];
    this.linkedTextUpdate = update;
    let options = new TextFilterOptions({textIds: this.linkedTextUpdate.linkedTexts});
    this.loadedLinkedTexts = this.textService.getTextsFiltered(options)
  }

  resetUpdateTimestamp(update: TeamUpdate) {
    update.timestamp = new Date();
  }
}
