import { Component, OnInit, Input } from "@angular/core";

import { Text, TextId } from "../../../common/text";
import { Racer, RacerId } from "../../../common/racer";
import { DataService } from "../../data.service";
import { TextService } from "../../text.service";

@Component({
  selector: 'text-widget',
  templateUrl: './text-widget.component.pug',
  styleUrls: ['./text-widget.component.scss']
})
export class TextWidget implements OnInit {
  @Input("text") textId: TextId;
  text: Text;
  textRacer: Racer;
  loadedText: boolean;
  error: boolean;

  constructor(
    private dataService: DataService,
    private textService: TextService
  ) {}

  ngOnInit() {
    console.log('TextWidget onInit');
    this.textService.getTextPromise(this.textId)
    .then(text => {
      this.text = text;
      let racerId = this.text.racer;
      if (racerId) {
        this.dataService.getRacerPromise(racerId)
        .then(racer => this.textRacer = racer);
      }
    })
    .catch(err => {
      console.error(err);
      this.error = err;
    })
  }
}
