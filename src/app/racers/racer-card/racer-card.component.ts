import { Component, Input, OnInit, OnDestroy } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";

import { Team } from '../../../common/team';
import { Location, TeamUpdate, TeamStatus } from '../../../common/update';
import { PhoneNumber, ContactNumber } from "../../../common/text";
import { Racer, RacerId } from '../../../common/racer';
import { DataService } from '../../data.service';

@Component({
  selector: 'racer-card',
  templateUrl: './racer-card.component.pug',
  styleUrls: ['./racer-card.component.scss']
})
export class RacerCardComponent implements OnInit, OnDestroy {
  id: RacerId;
  racer: Racer;
  paramsSub: any;
  routeSub: any;
  inEditMode: boolean = false;

  constructor(
    private dataService: DataService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {
    this.dataService.addRacersChangedListener(racers => {
      this.getRacer();
    })
  }

  getRacer() {
    this.racer = this.dataService.getRacer(this.id);
  }

  ngOnInit() {
    this.paramsSub = this.activatedRoute.params.subscribe(params => {
      this.id = params['id'];
      this.getRacer();
    });
    this.routeSub = this.activatedRoute.url.subscribe(urlSegments => {
      this.inEditMode = (urlSegments[urlSegments.length - 1].path == 'edit');
    });
  }

  ngOnDestroy() {
    this.paramsSub.unsubscribe();
  }

  enterEditMode() {
    this.router.navigate(['/safetyteam', 'racers', this.racer.id, 'edit']);
  }

  exitEditMode() {
    this.dataService.updateRacerAndWriteToBackend(this.racer)
    this.router.navigate(['/safetyteam', 'racers', this.racer.id]);
  }

  deleteRacer() {
    this.dataService.deleteRacer(this.racer.id);
    this.router.navigate(['/safetyteam', 'racers']);
  }

  goToRacerTexts(racer: Racer) {
    this.router.navigate(['/safetyteam', 'texts', 'by-racer', racer.id]);
  }

  addNumberToRacer() {
    let newContact = new ContactNumber(
      new PhoneNumber(undefined, undefined),
      undefined,
      true
    );
    if (!this.racer.phones) {
      this.racer.phones = [];
    }
    this.racer.phones.push(newContact);
  }

  removeContactFromRacer(contact) {
    let index = this.racer.phones.indexOf(contact);
    this.racer.phones.splice(index, 1);
  }
}
