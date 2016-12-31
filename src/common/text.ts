const APP_TEXT_HEADER = "!AutoUpdate!";

import * as libphonenumber from "google-libphonenumber";

export class PhoneNumber {
  constructor(
    public countryCode: string,
    public nationalNumber: string
  ) {}

  toE164() {
    return `+${this.countryCode}${this.nationalNumber}`
  }

  equals(other: PhoneNumber | string) {
    if (typeof other == 'string') {
      let otherString = other as string;
      return this.toE164() == otherString;
    }
    return this.countryCode == other.countryCode && this.nationalNumber == other.nationalNumber;
  }

  static parse(thing): PhoneNumber {
    if (!thing) {
      return undefined;
    }
    if (typeof thing == "string") {
      try {
        let phoneUtil = libphonenumber.PhoneNumberUtil.getInstance();
        let parsedMobile = phoneUtil.parse(thing, 'GB') as any;
        let countryCode = parsedMobile.getCountryCode();
        let nationalNumber = parsedMobile.getNationalNumber();
        return new PhoneNumber(countryCode, nationalNumber);
      } catch (err) {
        console.error(`Error when parsing phone number "${thing}"`, err);
        return undefined;
      }
    } else {
      return new PhoneNumber(thing.countryCode, thing.nationalNumber);
    }
  }
}

export class ContactNumber {
  constructor(
    public number: PhoneNumber,
    public notes: string,
    public preferred: boolean
  ) {}

  static fromJSON(obj) {
    return new ContactNumber(PhoneNumber.parse(obj.number), obj.notes, obj.preferred)
  }
}
export type TextId = string;

import { Racer, RacerId } from './racer';
import { Team, TeamId } from './team';
import { Location } from "./update";
import { UserActionInfo, UserWithoutPassword } from './user';

export interface DbFormText {
  text_subclass: string;

  id: TextId;
  body: string;
  to: PhoneNumber;
  from: PhoneNumber;
  racer: RacerId;
  team: TeamId;
  twilio: TwilioInboundText | TwilioOutboundText;
  timestamp: Date;
  readBy?: UserActionInfo;
  sentBy?: UserActionInfo;
}

export interface FullFormText {
  text_subclass: string;

  id: TextId;
  body: string;
  to: PhoneNumber;
  from: PhoneNumber;
  racer: Racer;
  team: Team;
  twilio: TwilioInboundText | TwilioOutboundText;
  timestamp: Date;
  readBy?: UserActionInfo;
  sentBy?: UserActionInfo;
}

export abstract class Text {
  text_subclass: string;

  id: TextId;
  body: string;
  to: PhoneNumber;
  from: PhoneNumber;
  racer: Racer;
  team: Team;
  timestamp: Date;

  abstract isRead(): boolean;

  static fromJSON(obj: FullFormText): Text {
    if (obj.text_subclass == 'AppText') {
      return AppText.fromJSON(obj);
    } else if (obj.text_subclass == 'InboundText') {
      return InboundText.fromJSON(obj);
    } else if (obj.text_subclass == 'OutboundText') {
      return OutboundText.fromJSON(obj);
    } else {
      // For non-updated ones!
      return InboundText.fromJSON(obj);
    }
  }

  toDbForm(): DbFormText {
    let copy = JSON.parse(JSON.stringify(this));
    if (this.racer) copy.racer = this.racer.id;
    if (this.team) copy.team = this.team.id;
    return copy;
  }
}

export class OutboundText extends Text {
  text_subclass: string = 'OutboundText'

  twilio: TwilioOutboundText;
  sentBy: UserActionInfo;

  static fromJSON(obj: FullFormText) {
    let racer = obj.racer ? Racer.fromJSON(obj.racer) : undefined;
    let team = obj.team ? Team.fromJSON(obj.team) : undefined;
    let sentBy = obj.sentBy ? UserActionInfo.fromJSON(obj.sentBy) : undefined;
    let clone = JSON.parse(JSON.stringify(obj));
    clone.racer = racer;
    clone.team = team;
    clone.sentBy = sentBy;
    return new OutboundText(clone.id, clone);
  }

  isRead(): boolean {
    return true;
  }

  static fromTwilio(id: TextId, twilio: TwilioOutboundText) {
    let p = {};
    p['body'] = twilio.body;
    p['to'] = PhoneNumber.parse(twilio.to);
    p['from'] = PhoneNumber.parse(twilio.from);
    p['twilio'] = twilio;
    p['timestamp'] = new Date();
    return new OutboundText(id, p);
  }

  constructor(id: TextId, properties) {
    super();
    this.id = id;
    this.body = properties.body;
    this.to = PhoneNumber.parse(properties.to);
    this.from = PhoneNumber.parse(properties.from);
    this.twilio = properties.twilio;
    this.timestamp = properties.timestamp;
    this.racer = properties.racer;
    this.team = properties.team;
    this.sentBy = properties.sentBy;
  }
}

export class InboundText extends Text {
  text_subclass: string = 'InboundText'

  twilio: TwilioInboundText;
  readBy: UserActionInfo;

  static fromJSON(obj: FullFormText) {
    let racer = obj.racer ? Racer.fromJSON(obj.racer) : undefined;
    let team = obj.team ? Team.fromJSON(obj.team) : undefined;
    let readBy = obj.readBy ? UserActionInfo.fromJSON(obj.readBy) : undefined;
    let clone = JSON.parse(JSON.stringify(obj));
    clone.racer = racer;
    clone.team = team;
    clone.readBy = readBy;
    return new InboundText(clone.id, clone);
  }

  static fromTwilio(id: TextId, twilio: TwilioInboundText) {
    let p = {};
    p['body'] = twilio.Body;
    p['to'] = twilio.To;
    p['from'] = twilio.From;
    p['twilio'] = twilio;
    p['timestamp'] = new Date();
    return new InboundText(id, p);
  }

  isRead(): boolean {
    return !!this.readBy;
  }

  constructor(id: TextId, properties) {
    super();
    this.id = id;
    this.body = properties.body;
    this.to = PhoneNumber.parse(properties.to);
    this.from = PhoneNumber.parse(properties.from);
    this.twilio = properties.twilio;
    this.timestamp = properties.timestamp;
    this.readBy = properties.readBy;
    this.racer = properties.racer;
    this.team = properties.team;
  }
}

export class AppText extends InboundText {
  text_subclass: string = 'AppText';

  static isAppText(text: TwilioInboundText) {
    return text.Body.indexOf(APP_TEXT_HEADER) == 0;
  }

  location: Location;

  constructor(id, obj) {
    super(id, obj);
    this.location = obj.location;
  }

  static fromJSON(obj) {
    if (!obj) {
      throw new Error('AppText fromJSON on invalid object!');
    }
    let racer = obj.racer ? Racer.fromJSON(obj.racer) : undefined;
    let team = obj.team ? Team.fromJSON(obj.team) : undefined;
    let readBy = obj.readBy ? UserActionInfo.fromJSON(obj.readBy) : undefined;
    let clone = JSON.parse(JSON.stringify(obj));
    clone.racer = racer;
    clone.team = team;
    clone.readBy = readBy;
    return new AppText(clone.id, clone);
  }

  static fromTwilio(id: TextId, twilio: TwilioInboundText) {
    let p = {};

    let messageWithoutHeader = twilio.Body.substring(APP_TEXT_HEADER.length + 1);
    let deEscaped1 = messageWithoutHeader.replace(/\\/g, "");
    let deEscaped2 = deEscaped1.replace(/\"\{/g, "{");
    let deEscaped3 = deEscaped2.replace(/\}\"/g, "}");
    let parsedAppMessage = JSON.parse(deEscaped3);
    
    p['body'] = parsedAppMessage.message;
    p['location'] = parsedAppMessage.location;
    p['to'] = twilio.To;
    p['from'] = twilio.From;
    p['twilio'] = twilio;
    p['timestamp'] = new Date();
    return new AppText(id, p);
  }
}

export interface TwilioInboundText {
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

export interface TwilioOutboundText {
  sid;
  date_created;
  date_updated;
  date_sent;
  account_sid;
  to;
  from;
  messaging_service_sid;
  body;
  status;
  num_segments;
  num_media;
  direction;
  api_version;
  price;
  price_unit;
  error_code;
  error_message;
  uri;
  subresource_uris: { media: string };
  dateCreated;
  dateUpdated;
  dateSent;
  accountSid;
  messagingServiceSid;
  numSegments;
  numMedia;
  apiVersion;
  priceUnit;
  errorCode;
  errorMessage;
  subresourceUris: { media: string };
}
