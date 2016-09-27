export type PhoneNumber = string;
export type TextId = string;

import { Racer } from './racer';
import { Team } from './team';

import * as moment from "moment";

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

  static fromJSON(obj) {
    return new Text(obj.id, obj);
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

  toDbForm() {
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
