import { Component, OnInit } from '@angular/core';
import { Router }            from '@angular/router';

import { Racer }                from '../../common/racer';
import { DataService }         from '../data.service';

import { MdIcon, MdIconRegistry } from "@angular2-material/icon";

@Component({
  selector: 'my-racers',
  templateUrl: './racers.template.html',
  styleUrls:  ['./racers.styles.scss'],
  directives: [MdIcon],
  viewProviders: [MdIconRegistry]
})
export class RacersComponent implements OnInit {
  racers: Racer[];

  constructor(
    private dataService: DataService,
    private router: Router) { }

  getRacers(): void {
    this.dataService
        .getRacers()
        .then(racers => this.racers = racers);
  }

  ngOnInit(): void {
    this.getRacers();
  }

  onSelect(racer: Racer): void {
    this.router.navigate(['/racers', racer.id]);
  }

  createRacer() {
    this.dataService.createRacer({})
      .then(racer => {
        this.getRacers();
        this.router.navigate(['/racers', racer.id, 'edit']);
      });
  }
}


/*
Copyright 2016 Google Inc. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at http://angular.io/license
*/
