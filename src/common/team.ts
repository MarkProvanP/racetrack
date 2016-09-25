import { Racer, RacerId } from "./racer";
import { TeamUpdate, TeamUpdateId, TeamStatus, Location, prettyStatusName } from "./update";

export type TeamId = string;
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
  lastCheckin: Date;

  static fromJSON(obj: PopulatedTeam) {
    let updates: [TeamUpdate] = obj.statusUpdates.map(TeamUpdate.fromJSON);
    let racers: [Racer] = obj.racers.map(Racer.fromJSON);
    let clone = JSON.parse(JSON.stringify(obj));
    clone.statusUpdates = updates;
    clone.racers = racers;
    return new Team(clone.id, clone);
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
    this.lastCheckin = properties.lastCheckin;
  }

  getCurrentStatus(): TeamStatus {
    if (this.statusUpdates.length > 0) {
      let update = this.statusUpdates[this.statusUpdates.length - 1]
      if (update instanceof TeamUpdate) {
        return update.status;
      } else {
        console.error("team status updates not yet populated");
        return TeamStatus.UNKNOWN;
      }
    } else {
      return TeamStatus.UNKNOWN;
    }
  }

  getLastUpdate(): TeamUpdate {
    return this.statusUpdates[this.statusUpdates.length - 1]
  }

  getCurrentStatusString(): string {
    return prettyStatusName(this.getCurrentStatus());
  }

  hasRacer(racer: Racer): boolean {
    return this.racers.filter(r => racer.id === r.id).length > 0;
  }
}


/*
Copyright 2016 Google Inc. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at http://angular.io/license
*/
