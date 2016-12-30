import { Component, OnInit } from '@angular/core';
import { Router }            from '@angular/router';

import { Racer }                from '../../common/racer';
import { DataService }         from '../data.service';

@Component({
  selector: 'my-racers',
  templateUrl: './racers.component.pug',
  styleUrls:  ['./racers.component.scss']
})
export class RacersComponent implements OnInit {
  racers: Racer[];

  constructor(
    private dataService: DataService,
    private router: Router
  ) {
    this.dataService.addRacersChangedListener(racers => {
      this.racers = racers;
    })
  }

  getRacerLink(racer: Racer) {
    return `/safetyteam/racers/${racer.id}`;
  }

  getRacers(): void {
    this.racers = this.dataService.getRacers();
  }

  ngOnInit(): void {
    this.getRacers();
  }

  createRacer() {
    let id = prompt("Enter ID");
    if (!id) {
      return;
    }
    let name = prompt("Enter name");
    if (!name) {
      return;
    }
    let properties = { id, name };
    this.dataService.createRacer(properties)
      .then(racer => {
        this.getRacers();
        this.router.navigate(['/safetyteam', 'racers', racer.id, 'edit']);
      });
  }
}
