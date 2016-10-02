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

  getTexts(): void {
    this.textService.getTexts()
      .then(texts => {
        this.texts = texts.reverse();
      });
  }

  onTextReceived(text) {
    this.texts.unshift(text);
  }

  ngOnInit(): void {
    this.getTexts();
    this.textService.onTextReceived(text => this.onTextReceived(text));
  }
}
