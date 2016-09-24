import { Racer } from "./racer";

export enum TeamStatus {
  ON_START_BUS, IN_UK, IN_EUROPE, IN_HOSTEL, DROPPED_OUT, ASLEEP, OVERDUE, MAYBE_LATE, IN_BUDAPEST, UNKNOWN
}

export class Location {
  latitude: string;
  longitude: string;
  place: string;
}

export class TeamUpdate {
  id: number;
  notes: string;
  timestamp: Date;
  status: TeamStatus;
  location: Location;

  constructor(id: number, newStatus: TeamStatus, location?: Location, notes?: string) {
    this.id = id;
    this.status = newStatus;
    this.location = location;
    this.notes = notes;
    this.timestamp = new Date();
  }
}

export class Team {
  id: number;
  name: string;
  statusUpdates: [TeamUpdate];
  racers: [Racer];

  constructor(id: number, name: string, racers?: [Racer]) {
    this.id = id;
    this.name = name;
    this.racers = racers;
  }

  // Try this;

  getCurrentStatus(): TeamStatus {
    if (this.statusUpdates.length > 0) {
      return this.statusUpdates[this.statusUpdates.length - 1].status;
    } else {
      return TeamStatus.UNKNOWN;
    }
  }
}


/*
Copyright 2016 Google Inc. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at http://angular.io/license
*/
