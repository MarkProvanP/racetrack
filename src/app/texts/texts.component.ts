import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";

import { Text } from '../../common/text';
import { DataService }         from '../data.service';

@Component({
  selector: "texts",
  templateUrl: "./texts.component.html",
  styleUrls: ["./texts.component.scss"]
})
export class TextsComponent implements OnInit {
  texts: [Text] = <Text>[];

  constructor(
    private dataService: DataService,
    private router: Router) {}

  getTexts(): void {
    this.dataService.getTexts()
      .then(texts => {
        this.texts = texts
        this.texts.forEach(text => this.addRacerToText(text));
      });
  }

  addRacerToText(text) {
    this.dataService.getRacerForPhoneNumber(text.from)
      .then(racer => {
        text.racer = racer
        this.dataService.getTeamForRacer(racer)
          .then(team => text.team = team);
      });
  }

  onTextReceived(text) {
    this.texts.push(text);
    this.addRacerToText(text)
  }

  ngOnInit(): void {
    this.getTexts();
    this.dataService.onTextReceived(text => this.onTextReceived(text));
  }
}
