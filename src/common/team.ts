import { Racer } from "./racer";

export enum TeamStatus {
  ON_START_BUS, IN_UK, IN_EUROPE, IN_HOSTEL, DROPPED_OUT, ASLEEP, OVERDUE, MAYBE_LATE, IN_CITY, UNKNOWN
}

function prettyStatusName(status: TeamStatus) {
  switch (status) {
    case TeamStatus.ON_START_BUS: return "On start bus";
    case TeamStatus.IN_UK: return "In UK";
    case TeamStatus.IN_EUROPE: return "In Europe";
    case TeamStatus.IN_HOSTEL: return "In hostel";
    case TeamStatus.DROPPED_OUT: return "Dropped out";
    case TeamStatus.ASLEEP: return "Asleep";
    case TeamStatus.OVERDUE: return "Check-in overdue!";
    case TeamStatus.MAYBE_LATE: return "May be late into city";
    case TeamStatus.IN_CITY: return "In city";
    case TeamStatus.UNKNOWN: return "Unknown!";
  }
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

  static fromJSON(obj) {
    return new TeamUpdate(obj.id, obj.status, obj.location, obj.notes)
  }

  constructor(id: TeamUpdateId, properties) {
    this.id = id;
    this.status = properties.newStatus;
    this.location = properties.location;
    this.notes = properties.notes;
    this.timestamp = new Date();
  }
}

export class Team {
  id: TeamId;
  name: string;
  statusUpdates: [TeamUpdate] = [];
  racers: [Racer] = [];

  static fromJSON(obj) {
    let u = obj.statusUpdates;
    let updates = [];
    if (u.length > 0) {
      updates = u.map(TeamUpdate.fromJSON);
    }
    return new Team(obj.id, obj.name, obj.racers, updates);
  }

  constructor(id: TeamId, properties) {
    this.id = id;
    this.name = properties.name;
    if (properties.racers) {
      this.racers = properties.racers;
    }
    if (properties.statusUpdates) {
      this.statusUpdates = properties.statusUpdates;
    }
  }

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

  getCurrentStatusString(): string {
    return prettyStatusName(this.getCurrentStatus());
  }
}


/*
Copyright 2016 Google Inc. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at http://angular.io/license
*/
