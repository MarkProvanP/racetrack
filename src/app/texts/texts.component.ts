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
  tabs = [
    {link: 'all', label: 'All'},
    {link: 'by-team', label: 'By Team'},
    {link: 'by-racer', label: 'By Racer'}
  ]
  activeLinkIndex = 0;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}
}
