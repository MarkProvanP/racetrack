import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";

import { Racer } from "../../../common/racer";
import { Team } from "../../../common/team";
import { Text } from '../../../common/text';
import { DataService } from '../../data.service';
import { TextService, TextFilterOptions } from '../../text.service';

@Component({
  selector: "racer-texts",
  templateUrl: "./racer-texts.template.html",
  styleUrls: ["./racer-texts.styles.scss"]
})
export class RacerTextsComponent implements OnInit {
  texts: Text[];
  racers: Racer[];
  selectedRacer: Racer;
  selectedRacerTexts: Text[];
  displayOptions = {
    oneline: false,
    team: true,
    timestamp: true
  }
  paramsSub: any;

  constructor(
    private dataService: DataService,
    private textService: TextService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {
    this.dataService.addRacersChangedListener(racers => {
      this.racers = racers;
    })
  }

  routeToRacer(racer: Racer) {
    this.router.navigate(['/safetyteam', 'texts', 'by-racer', racer.id]);
  }

  getRacers() {
    this.racers = this.dataService.getRacers()
  }

  selectTextsByRacer(racer: Racer) {
    this.selectedRacer = racer;
    if (racer) {
      let filterOptions = new TextFilterOptions({racer: this.selectedRacer});
      this.selectedRacerTexts = this.textService.getTextsFiltered(filterOptions); 
    } else {
      this.selectedRacerTexts = [];
    }
  }

  markTextAsRead(text) {
    this.textService.updateTextAndWriteToBackend(text)
  }

  numberUnreadMessagesForRacer(racer: Racer) {
    let filterOptions = new TextFilterOptions({racer: racer, read: false});
    return this.textService.getTextsFiltered(filterOptions).length;
  }

  private onTextsChanged() {
    this.selectTextsByRacer(this.selectedRacer);
  }

  ngOnInit(): void {
    this.textService.addTextsChangedCallback(texts => {
      this.texts = texts;
      this.onTextsChanged();
    });
    this.texts = this.textService.getAllTexts();
    this.getRacers();
    this.paramsSub = this.activatedRoute.params.subscribe(params => {
      let racer = this.racers.filter(racer => racer.id == params['id'])[0]
      this.selectTextsByRacer(racer);
    });
  }
}
