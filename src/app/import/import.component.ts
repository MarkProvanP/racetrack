import { Component, OnInit } from "@angular/core";

import { Team, TeamId } from "../../common/team";
import { Racer, RacerId } from "../../common/racer";
import { PhoneNumber } from "../../common/text";

import { DataService } from "../data.service";

import * as Papa from "papaparse";
import * as _ from "lodash";
import * as libphonenumber from "google-libphonenumber";
const PNF = require('google-libphonenumber').PhoneNumberFormat;

const TEAM_NAME = "Team name";
const RACER_NAME = "Racer name";
const RACER_MOBILE = "Mobile";
const AFFILIATION = "Hall/Society/Sport affiliation";
const TEAM_NUMBER = "Team Number";
const RACER_ID = "St Andrews Email";
function UsernameToEmail(username: String) {
  return username + "@st-andrews.ac.uk";
}

interface DataRow {
  teamNumber: TeamId,
  teamName: string,
  affiliation: string,
  racerName: string,
  racerId: RacerId,
  mobile: PhoneNumber,
}

interface ParseTeam {
  id: TeamId,
  name: string,
  affiliation: string,
  racers: ParseRacer[]
}

interface ParseRacer {
  id: RacerId,
  name: string,
  mobile: PhoneNumber
}

@Component({
  selector: 'import',
  templateUrl: './import.component.pug',
  styleUrls: ['./import.component.scss']
})
export class ImportComponent implements OnInit {
  parsedData: DataRow[];
  parsedTeams: Team[];

  teams: Team[];
  racers: Racer[];

  constructor(
    private dataService: DataService
  ) {
    this.dataService.addTeamsChangedListener(teams => this.teams = teams)
    this.dataService.addRacersChangedListener(racers => this.racers = racers)
  }

  ngOnInit() {
    this.teams = this.dataService.getTeams();
    this.racers = this.dataService.getRacers();
  }

  fileChangeEvent(fileInputEvent: any) {
    let fileInput = fileInputEvent.srcElement;
    let file = fileInput.files[0];
    let reader = new FileReader();
    reader.onload = (event: ProgressEvent) => {
      console.log('FileUpload onload', event);
      let reader = <FileReader> event.target;
      if (reader.error) {
        console.error('error reading file!');
        return;
      }
      let textContent = reader.result;
      let data = Papa.parse(textContent, {
        header: true
      });
      console.log(data);
      this.parsedData = data.data.map(row => this.parseRow(row))
      this.parsedTeams = undefined;
    }

    reader.readAsText(file);
  }

  process() {
    this.parsedTeams = [];
    let teamsObj = {};
    this.parsedData.forEach(row => {
      if (!teamsObj[row.teamNumber]) {
        teamsObj[row.teamNumber] = {
          id: row.teamNumber,
          name: row.teamName,
          racers: [],
          affiliation: row.affiliation,
        }
      }
      let team = teamsObj[row.teamNumber];
      team.racers.push({
        id: row.racerId,
        name: row.racerName,
        phones: [{
          number: row.mobile,
          notes: "Default",
          preferred: true
        }],
        email: UsernameToEmail(row.racerId)
      })
    })
    this.parsedTeams = Object.keys(teamsObj).map(teamId => teamsObj[teamId]);
  }

  createTeam(team: Team) {
    let racerPromises = team.racers.map(racer => this.dataService.createRacer(racer))
    Promise.all(racerPromises)
    .then(racers => {
      this.dataService.createTeam(team)
    })
  }

  parseRow(row) {
    let mobile = PhoneNumber.parse(row[RACER_MOBILE]);
    let parsed = {
      teamNumber: row[TEAM_NUMBER],
      teamName: row[TEAM_NAME],
      affiliation: row[AFFILIATION],
      racerName: row[RACER_NAME],
      racerId: row[RACER_ID],
      mobile: mobile
    }
    return parsed;
  }

  isRacerCreated(racer: Racer) {
    return this.racers.filter(r => racer.id == r.id).length > 0;
  }

  isTeamCreated(team: Team) {
    return this.teams.filter(t => team.id == t.id).length > 0;
  }
}
