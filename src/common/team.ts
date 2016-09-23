import { Racer } from "./racer";

export class Team {
  id: number;
  name: string;
  racers: [Racer];

  constructor(id: number, name: string, racers?: [Racer]) {
    this.id = id;
    this.name = name;
    this.racers = racers;
  }
}


/*
Copyright 2016 Google Inc. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at http://angular.io/license
*/
