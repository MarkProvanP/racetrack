import { UserActionInfo } from "./user";

export type ThingEventId = string;

export class ThingEvent {
  id: ThingEventId;
  byUser: UserActionInfo

  constructor(id: ThingEventId, properties) {
    this.id = id;
    this.byUser = properties.byUser;
  }

  static fromJSON(obj): ThingEvent {
    let clone = JSON.parse(JSON.stringify(obj));
    let byUser = UserActionInfo.fromJSON(obj.byUser)
    clone.byUser = byUser;
    if (obj.eventType == MassTextEvent.EVENT_TYPE) {
      return MassTextEvent.fromJSON(clone);
    }
    return new ThingEvent(obj.id, clone);
  }

  static create(id, properties) {
    if (properties.eventType == MassTextEvent.EVENT_TYPE) {
      return new MassTextEvent(id, properties);
    }
  }
}

export class MassTextEvent extends ThingEvent {
  static EVENT_TYPE = 'MassTextEvent'
  eventType: string = MassTextEvent.EVENT_TYPE;
  endedBy: UserActionInfo;
  keyword: string;
  timeout: number;
  body: string;

  constructor(id: ThingEventId, properties) {
    super(id, properties);
    this.endedBy = properties.endedBy;
    this.keyword = properties.keyword;
    this.timeout = properties.timeout;
    this.body = properties.body;
  }

  static fromJSON(obj): MassTextEvent {
    let clone = JSON.parse(JSON.stringify(obj));
    let endedBy = UserActionInfo.fromJSON(obj.endedBy)
    clone.endedBy = endedBy;
    return new MassTextEvent(obj.id, clone);
  }
}
