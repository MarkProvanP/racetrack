import { Component, Input, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";

import { Racer } from "../../../common/racer";
import { Team } from "../../../common/team";
import { Text } from '../../../common/text';
import { DataService } from '../../data.service';

import * as moment from "moment";

@Component({
  selector: "racer-texts",
  templateUrl: "./racer-texts.template.html",
  styleUrls: ["./racer-texts.styles.scss"]
})
export class RacerTextsComponent implements OnInit {
  @Input() texts: [Text];
  racers: [Racer];
  selectedRacer: Racer;
  selectedRacerTexts: [Text];
  displayOptions = {
    oneline: false,
    team: true,
    timestamp: true
  }
  paramsSub: any;

  constructor(
    private dataService: DataService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {};

  getTexts() {
    return this.dataService.getTexts()
      .then(texts => {
        this.texts = texts.reverse();
      });
  }

  routeToRacer(racer: Racer) {
    this.router.navigate(['/texts', 'by-racer', racer.id]);
  }

  getRacers() {
    return this.dataService.getRacers()
      .then(racers => {
        this.racers = racers;
      });
  }

  selectTextsByRacer(racer: Racer) {
    this.selectedRacer = racer;
    this.selectedRacerTexts = this.texts.filter(text => {
      if (racer && text.racer) {
        return text.racer.id === racer.id
      }
    });
  }

  markTextAsRead(text) {
    this.dataService.updateText(text)
  }
  onTextReceived(text) {
    this.texts.unshift(text);
  }

  ngOnInit(): void {
    this.getTexts()
      .then(texts => this.getRacers())
      .then(racers => {
        this.paramsSub = this.activatedRoute.params.subscribe(params => {
          let racer = this.racers.filter(racer => racer.id == params['id'])[0]
          this.selectTextsByRacer(racer);
        });
      });
    this.dataService.onTextReceived(text => this.onTextReceived(text));
  }
}
