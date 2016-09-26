export type PhoneNumber = string;
export type TextId = string;

import { Racer } from './racer';
import { Team } from './team';

export class Text {
  id: TextId;
  body: string;
  to: PhoneNumber;
  from: PhoneNumber;
  racer: Racer;
  team: Team;
  twilio: TwilioText;

  static fromJSON(obj) {
    return new Text(obj.id, obj);
  }

  static fromTwilio(id: TextId, twilio: TwilioText) {
    let p = {};
    p['body'] = twilio.Body;
    p['to'] = twilio.To;
    p['from'] = twilio.From;
    p['twilio'] = twilio;
    return new Text(id, p);
  }

  constructor(id: TextId, properties) {
    this.id = id;
    this.body = properties.body;
    this.to = properties.to;
    this.from = properties.from;
    this.twilio = properties.twilio;
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
