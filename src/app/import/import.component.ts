import { Component } from "@angular/core";

import { Team, TeamId } from "../../common/team";
import { Racer, RacerId } from "../../common/racer";
import { PhoneNumber } from "../../common/text";

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
export class ImportComponent {
  parsedData: DataRow[];
  parsedTeams: Team[];

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
          racers: []
        }
      }
      let team = teamsObj[row.teamNumber];
      team.racers.push({
        id: row.racerId,
        name: row.racerName,
        mobile: row.mobile
      })
    })
    this.parsedTeams = Object.keys(teamsObj).map(teamId => teamsObj[teamId]);
  }

  parseRow(row) {
    let phoneUtil = libphonenumber.PhoneNumberUtil.getInstance();
    let rawNumber = row[RACER_MOBILE];
    let formatted;
    try {
      let parsedMobile = phoneUtil.parse(rawNumber, 'GB');
      console.log(parsedMobile);
      formatted = phoneUtil.format(parsedMobile, PNF.E164);
      console.log(formatted);
    } catch (err) {
      console.error(`Phone number ${rawNumber} parse error`, err);
    }
    let parsed = {
      teamNumber: row[TEAM_NUMBER],
      teamName: row[TEAM_NAME],
      affiliation: row[AFFILIATION],
      racerName: row[RACER_NAME],
      racerId: row[RACER_ID],
      mobile: formatted
    }
    return parsed;
  }
}
