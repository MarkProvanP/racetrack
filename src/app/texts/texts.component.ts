import { Component } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";

import { Racer } from "../../common/racer";
import { Team } from "../../common/team";
import { Text } from '../../common/text';
import { TextService } from '../text.service';

import * as moment from "moment";

import { AllTextsComponent } from "./all-texts";
import { RacerTextsComponent } from "./racer-texts";
import { TeamTextsComponent } from "./team-texts";

@Component({
  selector: "texts",
  templateUrl: "./texts.template.html",
  styleUrls: ["./texts.styles.scss"]
})
export class TextsComponent {
  tabs = ['all', 'by-team', 'by-racer'];

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  goToTabIndex() {
    let split = this.router.url.split(/\/|\;|\?/);
    let tab = split[3];
    return this.tabs.indexOf(tab);
  }

  onSelectChange(event) {
    let selection = this.tabs[event.index];
    this.router.navigate(['/safetyteam', 'texts', selection]);
  }
}
