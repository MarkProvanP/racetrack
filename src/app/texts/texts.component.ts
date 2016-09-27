import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";

import { Racer } from "../../common/racer";
import { Team } from "../../common/team";
import { Text } from '../../common/text';
import { DataService }         from '../data.service';

import * as moment from "moment";

import { AllTextsComponent } from "./all-texts";
import { RacerTextsComponent } from "./racer-texts";
import { TeamTextsComponent } from "./team-texts";

@Component({
  selector: "texts",
  templateUrl: "./texts.template.html",
  styleUrls: ["./texts.styles.scss"]
})
export class TextsComponent implements OnInit {
  tabs = ['all', 'by-team', 'by-racer'];
  forceTabIndex: number = 0;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}


  ngOnInit() {
    let split = this.router.url.split("/");
    let tab = split[2];
    this.forceTabIndex = tab;
  }

  onSelectChange(event: MdTabChangeEvent) {
    let selection = this.tabs[event.index];
    this.router.navigate(['/texts', selection]);
  }
}
