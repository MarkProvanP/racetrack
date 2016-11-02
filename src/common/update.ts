import { UserActionInfo } from "./user";

export enum TeamStatus {
  ON_START_BUS, OKAY, CROSSING_CHANNEL, IN_HOSTEL, DROPPED_OUT, ASLEEP, OVERDUE, MAYBE_LATE, IN_CITY, UNKNOWN
}

export function prettyStatusName(status: TeamStatus) {
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

  static fromJSON(obj) {
    return new TeamUpdate(obj.id, obj)
  }

  toIdJSON() {
    return JSON.stringify(this);
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
  }
}
