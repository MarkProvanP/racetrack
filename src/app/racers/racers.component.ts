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

  constructor(
    private dataService: DataService,
    private router: Router
  ) {
    this.dataService.addRacersChangedListener(racers => {
      this.racers = racers;
    })
  }

  getRacers(): void {
    this.racers = this.dataService.getRacers();
  }

  ngOnInit(): void {
    this.getRacers();
  }

  onSelect(racer: Racer): void {
    this.router.navigate(['/safetyteam', 'racers', racer.id]);
  }

  createRacer() {
    this.dataService.createRacer({})
      .then(racer => {
        this.getRacers();
        this.router.navigate(['/safetyteam', 'racers', racer.id, 'edit']);
      });
  }
}


/*
Copyright 2016 Google Inc. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at http://angular.io/license
*/
