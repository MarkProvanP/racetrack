import { Component, OnInit } from "@angular/core";

import { DataService } from "../../data.service";
import { UserService } from "../../user.service";
import { TextService } from "../../text.service";

import { Team } from "../../../common/team";

import randomColor = require("randomcolor");

@Component({
  selector: 'debug-component',
  templateUrl: './debug.component.pug',
  styleUrls: ['./debug.component.scss']
})
export class DebugComponent implements OnInit {
  email = {
    to: "",
    subject: "",
    body: ""
  }

  teams: Team[] = [];

  constructor(
    private dataService: DataService,
    private userService: UserService,
    private textService: TextService
  ) {}

  ngOnInit() {
    this.dataService.getTeamsFromBackend()
    .then(teams => this.teams = teams)
  }

  prettyColors() {
    this.teams.forEach(team => {
      team.color = randomColor();
      this.dataService.updateTeamAndWriteToBackend(team);
    })
  }

  sendEmail() {
    this.dataService.sendEmail(this.email.to, this.email.subject, this.email.body)
    .then(res => console.log(res))
  }
}
