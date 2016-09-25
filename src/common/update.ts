export enum TeamStatus {
  ON_START_BUS, IN_UK, IN_EUROPE, IN_HOSTEL, DROPPED_OUT, ASLEEP, OVERDUE, MAYBE_LATE, IN_CITY, UNKNOWN
}

export function prettyStatusName(status: TeamStatus) {
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

export type TeamUpdateId = string;

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
    return new TeamUpdate(obj.id, obj)
  }

  toIdJSON() {
    return JSON.stringify(this);
  }

  constructor(id: TeamUpdateId, properties) {
    this.id = id;
    this.status = properties.newStatus;
    this.location = properties.location;
    this.notes = properties.notes;
    this.timestamp = new Date();
  }
}
