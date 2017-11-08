const APP_TEXT_HEADER = "!AutoUpdate!";

import * as libphonenumber from "google-libphonenumber";
import * as moment from "moment";

function getTwilioSid(twilio) {
  return twilio.SmsSid || twilio.sid;
}

function getTwilioFrom(twilio) {
  return twilio.from || twilio.From;
}

function getTwilioTo(twilio) {
  return twilio.to || twilio.To;
}

function getTwilioBody(twilio) {
  return twilio.body|| twilio.Body;
}

function getTwilioTimestamp(twilio) {
  if (!twilio.date_created) return 
  return moment(twilio.date_created, 'ddd, DD MMM YYYY HH:mm:ss ZZ').toDate();
}

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

  exists() {
    return this.countryCode && this.nationalNumber;
  }

  static parse(thing): PhoneNumber {
    if (!thing) {
      return new PhoneNumber(undefined, undefined);
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
        return new PhoneNumber(undefined, undefined);
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

export abstract class Text {
  text_subclass: string;

  static getTextSid(obj) {
    return obj.twilio ? getTwilioSid(obj.twilio) : (obj.twilioSid || obj.SmsSid || obj.twilioSid)
  }

  static getTextBody(obj) {
    return obj.twilio ? getTwilioBody(obj.twilio) : (obj.body || obj.Body)
  }

  static createFromTwilio(id, twilio) {
    return AppText.isAppText(twilio) ? AppText.fromTwilio(id, twilio) : InboundText.fromTwilio(id, twilio);
  }

  public id: TextId;
  public twilioSid: string;
  public body: string;
  public to: PhoneNumber;
  public from: PhoneNumber;
  public racer: RacerId;
  public team: TeamId;
  public timestamp: Date;

  public getBody() {
    return this.body
  }

  public getTo() {
    return this.to;
  }

  public getFrom() {
    return this.from;
  }

  public getTeam() {
    return this.team;
  }

  public getRacer() {
    return this.racer;
  }

  abstract isRead(): boolean;
  abstract isOutgoing(): boolean;
  
  static isTextOutgoing(text) {
    if (!text) {
      return false;
    }
    if (text.isOutgoing) {
      return text.isOutgoing();
    } else {
      if (text.text_subclass == 'AppText' || text.text_subclass == 'InboundText') return false;
      if (text.text_subclass == 'OutboundText') return true;
      else return (<NonNativeText> text).outgoing;
    }
  }

  static fromJSON(obj): Text {
    if (obj.text_subclass == 'AppText') {
      return AppText.fromJSON(obj);
    } else if (obj.text_subclass == 'InboundText') {
      return InboundText.fromJSON(obj);
    } else if (obj.text_subclass == 'OutboundText') {
      return OutboundText.fromJSON(obj);
    } else if (obj.text_subclass == 'NonNativeText' || obj.text_subclass == 'NonNativeInboundText') {
      return NonNativeText.fromJSON(obj);
    } else {
      // For non-updated ones!
      return InboundText.fromJSON(obj);
    }
  }

  constructor(id: TextId, properties) {
    this.id = id;
    this.twilioSid = properties.twilioSid;
  }

  toDbForm(): Text {
    let copy = JSON.parse(JSON.stringify(this));
    // HOTFIX use racer/team ID, not object
    let anyThis = this as any;
    if (this.racer) {
      copy.racer = anyThis.racer.id ? anyThis.racer.id : this.racer;
    }
    if (this.team) {
      copy.team = anyThis.team.id ? anyThis.team.id : this.team;
    }
    return copy;
  }
}

export class NonNativeText extends Text {
  text_subclass = "NonNativeText";
  addedBy: UserActionInfo;
  readBy: UserActionInfo;
  outgoing: boolean;

  isOutgoing() {
    return this.outgoing;
  }

  static fromJSON(obj) {
    let clone = JSON.parse(JSON.stringify(obj));
    return new NonNativeText(clone.id, clone);
  }

  isRead() {
    return true;
  }

  constructor(id: TextId, properties) {
    super(id, properties);
    this.body = properties.body;
    this.to = PhoneNumber.parse(properties.to);
    this.from = PhoneNumber.parse(properties.from);
    this.timestamp = properties.timestamp;
    this.addedBy = UserActionInfo.fromJSON(properties.addedBy)
    this.readBy = UserActionInfo.fromJSON(properties.readBy);
  }
}

export class OutboundText extends Text {
  text_subclass: string = 'OutboundText'

  twilio: TwilioOutboundText;
  sentBy: UserActionInfo;

  isOutgoing() {
    return true;
  }

  static fromJSON(obj) {
    let clone = JSON.parse(JSON.stringify(obj));
    let readBy = obj.readBy ? UserActionInfo.fromJSON(obj.readBy) : undefined;
    let sentBy = obj.sentBy ? UserActionInfo.fromJSON(obj.sentBy) : undefined;
    clone.readBy = readBy;
    clone.sentBy = sentBy;
    if (obj.racer) {
      // HOTFIX take racer ID, not whole object
      clone.racer = obj.racer.id ? obj.racer.id : obj.racer
    }
    if (obj.team) {
      // HOTFIX take team ID not whole object
      clone.team = obj.team.id ? obj.team.id : obj.team
    }
    return new OutboundText(clone.id, clone);
  }

  isRead(): boolean {
    return true;
  }

  static fromTwilio(id: TextId, twilio: TwilioOutboundText | TwilioRecord) {
    let p = {};
    p['body'] = getTwilioBody(twilio);
    p['to'] = PhoneNumber.parse(getTwilioTo(twilio));
    p['from'] = PhoneNumber.parse(getTwilioFrom(twilio));
    p['twilio'] = twilio;
    p['timestamp'] = getTwilioTimestamp(twilio) || new Date();
    p['twilioSid'] = getTwilioSid(twilio);
    return new OutboundText(id, p);
  }

  constructor(id: TextId, properties) {
    super(id, properties);
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

  isOutgoing() {
    return false;
  }

  static fromJSON(obj) {
    let clone = JSON.parse(JSON.stringify(obj));
    let readBy = obj.readBy ? UserActionInfo.fromJSON(obj.readBy) : undefined;
    clone.readBy = readBy;
    if (obj.racer) {
      // HOTFIX take racer ID, not whole object
      clone.racer = obj.racer.id ? obj.racer.id : obj.racer
    }
    if (obj.team) {
      // HOTFIX take team ID not whole object
      clone.team = obj.team.id ? obj.team.id : obj.team
    }
    // HOTFIX for missed timestamp
    if (clone.twilio) {
      let twilioTimestamp = getTwilioTimestamp(clone.twilio)
      if (twilioTimestamp) {
        clone.timestamp = twilioTimestamp;
      }
    }

    return new InboundText(clone.id, clone);
  }

  static fromTwilio(id: TextId, twilio: TwilioInboundText | TwilioRecord) {
    let p = {};
    p['body'] = getTwilioBody(twilio);
    p['to'] = getTwilioTo(twilio);
    p['from'] = getTwilioFrom(twilio);
    p['twilio'] = twilio;
    p['timestamp'] = getTwilioTimestamp(twilio) || new Date();
    p['twilioSid'] = getTwilioSid(twilio);
    return new InboundText(id, p);
  }

  isRead(): boolean {
    return !!this.readBy;
  }

  constructor(id: TextId, properties) {
    super(id, properties);
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

  static isAppText(text: TwilioInboundText | TwilioRecord) {
    let body = Text.getTextBody(text)
    return body.indexOf(APP_TEXT_HEADER) == 0;
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
    let clone = JSON.parse(JSON.stringify(obj));
    let readBy = obj.readBy ? UserActionInfo.fromJSON(obj.readBy) : undefined;
    clone.readBy = readBy;
    if (obj.racer) {
      // HOTFIX take racer ID, not whole object
      clone.racer = obj.racer.id ? obj.racer.id : obj.racer
    }
    if (obj.team) {
      // HOTFIX take team ID not whole object
      clone.team = obj.team.id ? obj.team.id : obj.team
    }
    return new AppText(clone.id, clone);
  }

  static fromTwilio(id: TextId, twilio: TwilioInboundText | TwilioRecord) {
    let p = {};

    let messageWithoutHeader = getTwilioBody(twilio).substring(APP_TEXT_HEADER.length + 1);
    let deEscaped1 = messageWithoutHeader.replace(/\\/g, "");
    let deEscaped2 = deEscaped1.replace(/\"\{/g, "{");
    let deEscaped3 = deEscaped2.replace(/\}\"/g, "}");
    let parsedAppMessage = JSON.parse(deEscaped3);
    
    p['body'] = parsedAppMessage.message;
    p['location'] = parsedAppMessage.location;
    p['to'] = getTwilioTo(twilio)
    p['from'] = getTwilioFrom(twilio)
    p['twilio'] = twilio;
    p['timestamp'] = getTwilioTimestamp(twilio) || new Date();
    p['twilioSid'] = getTwilioSid(twilio);
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

export interface TwilioRecord {
  sid,
  date_created,
  date_updated,
  date_sent,
  account_sid,
  to,
  from,
  messaging_service_sid,
  body,
  status,
  num_segments,
  num_media,
  direction,
  api_version,
  price,
  price_unit,
  error_code,
  error_message,
  uri,
  subresource_uris: { media: string }
}

