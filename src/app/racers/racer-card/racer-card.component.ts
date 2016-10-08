import { Component, Input, OnInit, OnDestroy } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";

import { Team } from '../../../common/team';
import { Location, TeamUpdate, TeamStatus } from '../../../common/update';
import { Racer } from '../../../common/racer';
import { DataService } from '../../data.service';

import { OrderBy } from '../../orderBy.pipe.ts';

@Component({
  selector: 'racer-card',
  templateUrl: './racer-card.template.html',
  styleUrls: ['./racer-card.styles.scss'],
  pipes: [OrderBy]
})
export class RacerCardComponent implements OnInit, OnDestroy {
  racer: Racer;
  paramsSub: any;
  routeSub: any;
  inEditMode: boolean = false;

  constructor(
    private dataService: DataService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.paramsSub = this.activatedRoute.params.subscribe(params => {
      this.dataService.getRacer(params['id'])
        .then(racer => this.racer = racer)
    });
    this.routeSub = this.activatedRoute.url.subscribe(urlSegments => {
      this.inEditMode = (urlSegments[urlSegments.length - 1].path == 'edit');
    });
  }

  ngOnDestroy() {
    this.paramsSub.unsubscribe();
  }

  enterEditMode() {
    this.router.navigate(['/racers', this.racer.id, 'edit']);
  }

  exitEditMode() {
    this.dataService.updateRacer(this.racer)
      .then(racer =>  {
        this.router.navigate(['/racers', racer.id]);
      });
  }

  deleteRacer() {
    this.dataService.deleteRacer(this.racer.id);
    this.router.navigate(['/racers']);
  }

  goToRacerTexts(racer: Racer) {
    this.router.navigate(['/texts', 'by-racer', racer.id]);
  }

  addNumberToRacer() {
    this.racer.phones.push({});
  }

  removeContactFromRacer(contact) {
    let index = this.racer.phones.indexOf(contact);
    this.racer.phones.splice(index, 1);
  }
}
