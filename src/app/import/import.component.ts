import { Component } from "@angular/core";

import * as Papa from "papaparse";
const TEAM_NAME = "Team name";
const RACER_NAME = "Racer name";
const MOBILE = "Mobile";
const AFFILIATION = "Hall/Society/Sport affiliation";

@Component({
  selector: 'import',
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.scss']
})
export class ImportComponent {
  data: string[][];

  fileChangeEvent(fileInput: any) {
    let file = fileInput.target.files[0];
    let reader = new FileReader();
    reader.onload = (event) => {
      if (event.target.readyState != 2) {
        return;
      }
      if (event.target.error) {
        console.error('error reading file!');
        return;
      }
      let textContent = event.target.result;
      this.data = Papa.parse(textContent, {
        header: true
      });
    }

    reader.readAsText(file);
  }


  sortTeamsThenRacers(data) {
    return data.sort((r1, r2) => {
      let r1team = r1[TEAM_NAME].toLowerCase();
      let r2team = r2[TEAM_NAME].toLowerCase();
      let r1racer = r1[RACER_NAME].toLowerCase();
      let r2racer = r2[RACER_NAME].toLowerCase();

      if (r1team < r2team) return -1;
      if (r2team > r1team) return 1;
      if (r1racer < r2racer) return -1;
      if (r2racer > r1racer) return 1;
      return 0;
    })
  }

  relevantFields(fields) {
    return fields.filter(field => {
      switch (field) {
        case TEAM_NAME:
        case RACER_NAME:
        case MOBILE:
        case AFFILIATION:
        return true;
      }
      return false;
    })
  }

  toList(obj) {
    return this.relevantFields(Object.keys(obj)).map(key => obj[key]);
  }
}
