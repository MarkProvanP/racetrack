import { Racer } from "./racer";

export enum TeamStatus {
  ON_START_BUS, IN_UK, IN_EUROPE, IN_HOSTEL, DROPPED_OUT, ASLEEP, OVERDUE, MAYBE_LATE, IN_BUDAPEST, UNKNOWN
}

export type TeamId = number;
export type TeamUpdateId = number;

export class Location {
  latitude: string;
  longitude: string;
  place: string;
}

export class TeamUpdate {
  id: TeamUpdateId;
  notes: string;
  timestamp: Date;
  status: TeamStatus;
  location: Location;

  constructor(id: TeamUpdateId, newStatus: TeamStatus, location?: Location, notes?: string) {
    this.id = id;
    this.status = newStatus;
    this.location = location;
    this.notes = notes;
    this.timestamp = new Date();
  }
}

export class Team {
  id: TeamId;
  name: string;
  statusUpdates: [TeamUpdateId | TeamUpdate] = [];
  racers: [Racer];

  constructor(id: TeamId, name: string, racers?: [Racer]) {
    this.id = id;
    this.name = name;
    this.racers = racers;
  }

  // Try this;

  getCurrentStatus(): TeamStatus {
    if (this.statusUpdates.length > 0) {
      let update = this.statusUpdates[this.statusUpdates.length - 1]
      if (update instanceof TeamUpdate) {
        return update.status;
      } else {
        console.log("team status updates not yet populated");
        return TeamStatus.UNKNOWN;
      }
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
