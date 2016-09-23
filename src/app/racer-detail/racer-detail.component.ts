import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';

import { Racer }        from '../../common/racer';
import { DataService } from '../data.service';

@Component({
  selector: 'my-racer-detail',
  templateUrl: './racer-detail.component.html',
  styleUrls: ['./racer-detail.component.scss']
})
export class RacerDetailComponent implements OnInit {
  racer: Racer;

  constructor(
    private dataService: DataService,
    private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.route.params.forEach((params: Params) => {
      let id = +params['id'];
      this.dataService.getRacer(id)
        .then(racer => this.racer = racer);
    });
  }

  save(): void {
    this.dataService.updateRacer(this.racer)
      .then(this.goBack);
  }

  goBack(): void {
    window.history.back();
  }
}


/*
Copyright 2016 Google Inc. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at http://angular.io/license
*/
