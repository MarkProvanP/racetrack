import { UserActionInfo } from "./user";
import { TextId } from "./text";

export enum TeamStatus {
  ON_START_BUS, OKAY, CROSSING_CHANNEL, IN_HOSTEL, DROPPED_OUT, ASLEEP, OVERDUE, MAYBE_LATE, IN_CITY, UNKNOWN
}

export function prettyStatusName(status: TeamStatus) {
  status = Number(status);
  switch (status) {
    case TeamStatus.ON_START_BUS: return "On start bus";
    case TeamStatus.OKAY: return "OK"
    case TeamStatus.CROSSING_CHANNEL: return "Crossing the channel";
    case TeamStatus.IN_HOSTEL: return "In hostel";
    case TeamStatus.DROPPED_OUT: return "Dropped out";
    case TeamStatus.ASLEEP: return "Asleep";
    case TeamStatus.OVERDUE: return "Check-in overdue!";
    case TeamStatus.MAYBE_LATE: return "May be late into city";
    case TeamStatus.IN_CITY: return "In city";
    case TeamStatus.UNKNOWN: return "Unknown!";
  }
}

export type TeamUpdateId = string;

export class Location {
  latitude: number;
  longitude: number;
  place: string;
  source: string;
  accuracy: any;
}

export const LOCATION_SOURCES = {
  GPS: "gps",
  NETWORK: "network",
  MANUAL: "manual"
}

export function MakeCoordsNumbers(location: Location) {
  location.latitude = Number(location.latitude);
  location.longitude = Number(location.longitude);
  return location;
}

export class TeamUpdate {
  id: TeamUpdateId;
  notes: string;
  timestamp: Date;
  status: TeamStatus;
  location: Location;
  isPublic: boolean;
  byUser: UserActionInfo;
  linkedTexts: TextId[];

  static fromJSON(obj) {
    let clone = JSON.parse(JSON.stringify(obj));
    let byUser = UserActionInfo.fromJSON(obj.byUser);
    clone.byUser = byUser;
    return new TeamUpdate(obj.id, clone)
  }

  makeClone() {
    let clone = JSON.parse(JSON.stringify(this));
    return TeamUpdate.fromJSON(clone);
  }

  prettyStatusName() {
    return prettyStatusName(this.status);
  }

  constructor(id: TeamUpdateId, properties) {
    this.id = id;
    this.status = Number(properties.status);
    this.location = MakeCoordsNumbers(properties.location);
    this.notes = properties.notes;
    if (properties.timestamp) {
      this.timestamp = properties.timestamp;
    } else {
      this.timestamp = new Date();
    }
    this.isPublic = properties.isPublic;
    this.byUser = properties.byUser;
    this.linkedTexts = properties.linkedTexts || [];
  }
}
