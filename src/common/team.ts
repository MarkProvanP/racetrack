import { Racer, RacerId } from "./racer";
import { TeamUpdate, TeamUpdateId, TeamStatus, Location, prettyStatusName } from "./update";

export type TeamId = number;
export interface UnpopulatedTeam {
  id: TeamId;
  name: string;
  statusUpdates: [TeamUpdateId];
  racers: [RacerId];
}
export interface PopulatedTeam {
  id: TeamId;
  name: string;
  statusUpdates: [TeamUpdate];
  racers: [Racer];
}

export class Team {
  id: TeamId;
  name: string;
  statusUpdates: [TeamUpdate] = <[TeamUpdate]>[];
  racers: [Racer] = <[Racer]>[];

  static fromJSON(obj: PopulatedTeam) {
    let u = obj.statusUpdates;
    let updates = u.map(TeamUpdate.fromJSON);
    return new Team(obj.id, obj);
  }

  depopulate(): UnpopulatedTeam {
    let copy = JSON.parse(JSON.stringify(this));
    copy.statusUpdates = this.statusUpdates.map(update => update.id);
    copy.racers = this.racers.map(racer => racer.id);
    return copy;
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
