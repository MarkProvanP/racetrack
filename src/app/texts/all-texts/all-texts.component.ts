import { Component, Input, OnInit } from "@angular/core";
import { Router } from "@angular/router";

import { Racer } from "../../../common/racer";
import { Team } from "../../../common/team";
import { Text } from '../../../common/text';
import { TextService } from '../../text.service';

import * as moment from "moment";

@Component({
  selector: "all-texts",
  templateUrl: "./all-texts.template.html",
  styleUrls: ["./all-texts.styles.scss"]
})
export class AllTextsComponent {
  texts: [Text];
  displayOptions = {
    name: true,
    number: true,
    team: true,
    oneline: true;
  }

  constructor(
    private textService: TextService,
    private router: Router) {}

  private onTextsChanged() {
  
  }

  ngOnInit(): void {
    this.textService.addTextsChangedCallback(texts => {
      this.texts = texts;
      this.onTextsChanged();
    });
    this.texts = this.textService.getAllTexts();
  }
}
