import { Component, OnInit } from '@angular/core';
import { Router }            from '@angular/router';

import { Racer }                from '../../common/racer';
import { DataService }         from '../data.service';

@Component({
  selector: 'my-racers',
  templateUrl: './racers.template.html',
  styleUrls:  ['./racers.styles.scss']
})
export class RacersComponent implements OnInit {
  racers: Racer[];
  selectedRacer: Racer;

  constructor(
    private dataService: DataService,
    private router: Router) { }

  getRacers(): void {
    this.dataService
        .getRacers()
        .then(racers => this.racers = racers);
  }

  add(name: string): void {
    name = name.trim();
    if (!name) { return; }
    let properties = {name: name};
    this.dataService.createRacer(properties)
      .then(racer => {
        this.racers.push(racer);
        this.selectedRacer = null;
      });
  }

  delete(racer: Racer): void {
    console.log('deleting racer', racer);
    this.dataService
        .deleteRacer(racer.id)
        .then(() => {
          this.racers = this.racers.filter(h => h !== racer);
          if (this.selectedRacer === racer) { this.selectedRacer = null; }
        });
  }

  ngOnInit(): void {
    this.getRacers();
  }

  onSelect(racer: Racer): void {
    this.selectedRacer = racer;
  }

  gotoRacerDetail(): void {
    this.router.navigate(['/racer', this.selectedRacer.id]);
  }
}


/*
Copyright 2016 Google Inc. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at http://angular.io/license
*/
