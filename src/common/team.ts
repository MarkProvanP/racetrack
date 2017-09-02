import { Racer, RacerId } from "./racer";
import { TeamUpdate, TeamUpdateId, TeamStatus, Location, prettyStatusName } from "./update";
import { UserActionInfo } from "./user";

import * as moment from "moment";

export interface CheckinInfo {
  checkinTime: Date;
  byUser: UserActionInfo;
}

export type TeamId = string;
export interface DbFormTeam {
  id: TeamId;
  name: string;
  statusUpdates: TeamUpdateId[];
  racers: RacerId[];
  lastCheckin: CheckinInfo;
}
export interface UnpopulatedTeam {
  id: TeamId;
  name: string;
  statusUpdates: TeamUpdateId[];
  racers: RacerId[];
  lastCheckin: CheckinInfo;
}
export interface PopulatedTeam {
  id: TeamId;
  name: string;
  statusUpdates: TeamUpdate[];
  racers: Racer[];
  lastCheckin: CheckinInfo;
}

export type Color = string;

export class Team {
  id: TeamId;
  name: string;
  statusUpdates: TeamUpdate[] = [];
  racers: Racer[] = [];
  lastCheckin: CheckinInfo;
  inEurope: boolean = false;
  notes: string;
  color: Color;
  affiliation: string;

  stripPrivateData(): Team {
    let strippedRacers = this.racers.map(racer => racer.stripPrivateData());
    let strippedStatusUpdates = this.statusUpdates.filter(update => update.isPublic);
    let stripped = this.makeClone();
    stripped.racers = strippedRacers;
    stripped.statusUpdates = strippedStatusUpdates;
    stripped.lastCheckin = undefined;
    return stripped;
  }

  makeClone() {
    let copy = JSON.parse(JSON.stringify(this));
    return Team.fromJSON(copy);
  }

  static fromJSON(obj: PopulatedTeam) {
    let updates = obj.statusUpdates
      .map(team => TeamUpdate.fromJSON(team));
    let racers = obj.racers
      .map(racer => Racer.fromJSON(racer));
    let lastCheckin = obj.lastCheckin ? {
      checkinTime: obj.lastCheckin.checkinTime,
      byUser: UserActionInfo.fromJSON(obj.lastCheckin.byUser)
    } : undefined;
    let clone = JSON.parse(JSON.stringify(obj));
    clone.statusUpdates = updates;
    clone.racers = racers;
    clone.lastCheckin = lastCheckin;
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
    this.inEurope = Boolean(properties.inEurope);
    this.notes = properties.notes;
    this.color = properties.color;
    this.affiliation = properties.affiliation;
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

  getPrettyRacersList(): string {
    let racerNames = this.racers.map(racer => racer.name);
    return racerNames.join(", ");
  }

  getLastUpdate(): TeamUpdate {
    return this.statusUpdates[this.statusUpdates.length - 1]
  }

  getLastPlaceName(): string {
    let lastStatusUpdate = this.statusUpdates[this.statusUpdates.length - 1];
    if (lastStatusUpdate) {
      return lastStatusUpdate.location.place;
    }
  }

  getCurrentStatusString(): string {
    return prettyStatusName(this.getCurrentStatus());
  }

  hasRacer(racer: Racer | RacerId): boolean {
    if (!racer) {
      return false;
    }
    if (typeof racer == 'string') {
      return this.racers.filter(r => racer == r.id).length > 0;
    } else {
      return this.racers.filter(r => racer.id === r.id).length > 0;
    }
  }

  getPrettyTimeSinceCheckin() {
    let now = moment();
    let diff = moment(this.lastCheckin.checkinTime).diff(now);
    return moment.duration(diff).humanize(true);
  }
}
