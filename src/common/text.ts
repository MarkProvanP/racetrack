export type PhoneNumber = string;
export type TextId = string;

import { Racer, RacerId } from './racer';
import { Team, TeamId } from './team';

import * as moment from "moment";

export interface DbFormText {
  id: TextId;
  body: string;
  to: PhoneNumber;
  from: PhoneNumber;
  racer: RacerId;
  team: TeamId;
  twilio: TwilioText;
  timestamp: Date;
  read: boolean;
}

export interface FullFormText {
  id: TextId;
  body: string;
  to: PhoneNumber;
  from: PhoneNumber;
  racer: Racer;
  team: Team;
  twilio: TwilioText;
  timestamp: Date;
  read: boolean;

}

export class Text {
  id: TextId;
  body: string;
  to: PhoneNumber;
  from: PhoneNumber;
  racer: Racer;
  team: Team;
  twilio: TwilioText;
  timestamp: Date;
  read: boolean;

  static fromJSON(obj: FullFormText) {
    let racer = Racer.fromJSON(obj.racer);
    let team = Team.fromJSON(obj.team);
    let clone = JSON.parse(JSON.stringify(obj));
    clone.racer = racer;
    clone.team = team;
    return new Text(clone.id, clone);
  }

  static fromTwilio(id: TextId, twilio: TwilioText) {
    let p = {};
    p['body'] = twilio.Body;
    p['to'] = twilio.To;
    p['from'] = twilio.From;
    p['twilio'] = twilio;
    p['timestamp'] = new Date();
    return new Text(id, p);
  }

  getPrettyTimestamp(): string {
    return moment(this.timestamp).format('HH:mm ddd, Do MMM');
  }

  toDbForm(): DbFormText {
    let copy = JSON.parse(JSON.stringify(this));
    if (this.racer) copy.racer = this.racer.id;
    if (this.team) copy.team = this.team.id;
    return copy;
  }

  constructor(id: TextId, properties) {
    this.id = id;
    this.body = properties.body;
    this.to = properties.to;
    this.from = properties.from;
    this.twilio = properties.twilio;
    this.timestamp = properties.timestamp;
    this.read = !!properties.read;
    this.racer = properties.racer;
    this.team = properties.team;
  }
}

export interface TwilioText {
  AccountSid;
  ApiVersion;
  Body;
  From;
  FromCity;
  FromCountry;
  FromState;
  FromZip;
  id;
  MessageSid;
  NumMedia;
  NumSegments;
  SmsMessageSid;
  SmsSid;
  SmsStatus;
  To;
  ToCity;
  ToCountry;
  ToState;
  ToZip;
}
