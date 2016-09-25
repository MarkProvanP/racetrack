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
  twilio: {};

  static fromTwilio(twilio: {}) {
    return new Text(twilio);
  }

  constructor(twilio: {}) {
    this.twilio = twilio;
    this.id = twilio.SmsSid;
    this.body = twilio.Body;
    this.to = twilio.To;
    this.from = twilio.From;
  }
}
