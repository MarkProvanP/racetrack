const APP_TEXT_HEADER = "!AutoUpdate!";

export type PhoneNumber = string;
export interface ContactNumber {
  number: PhoneNumber,
  notes: string,
  preferred: boolean
}
export type TextId = string;

import { Racer, RacerId } from './racer';
import { Team, TeamId } from './team';
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
    let clone = JSON.parse(JSON.stringify(obj));
    clone.racer = racer;
    clone.team = team;
    return new OutboundText(clone.id, clone);
  }

  isRead(): boolean {
    return true;
  }

  static fromTwilio(id: TextId, twilio: TwilioOutboundText) {
    let p = {};
    p['body'] = twilio.body;
    p['to'] = twilio.to;
    p['from'] = twilio.from;
    p['twilio'] = twilio;
    p['timestamp'] = new Date();
    return new OutboundText(id, p);
  }

  getPrettySentStatus() {
    if (this.sentBy) {
      let name = this.sentBy.user.name;
      return "Sent by " + name;
    } else {
      return "Unknown sent info";
    }
  }

  constructor(id: TextId, properties) {
    super();
    this.id = id;
    this.body = properties.body;
    this.to = properties.to;
    this.from = properties.from;
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
    let clone = JSON.parse(JSON.stringify(obj));
    clone.racer = racer;
    clone.team = team;
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
    this.to = properties.to;
    this.from = properties.from;
    this.twilio = properties.twilio;
    this.timestamp = properties.timestamp;
    this.readBy = properties.readBy;
    this.racer = properties.racer;
    this.team = properties.team;
  }
}

export interface AppTextLocation {
  latitude: string;
  longitude: string;
  accuracy: string;
  source: string;
}

export class AppText extends InboundText {
  text_subclass: string = 'AppText';

  location: AppTextLocation;

  constructor(id, obj) {
    super(id, obj);
    this.location = obj.location;
  }

  static fromJSON(obj) {
    let racer = obj.racer ? Racer.fromJSON(obj.racer) : undefined;
    let team = obj.team ? Team.fromJSON(obj.team) : undefined;
    let clone = JSON.parse(JSON.stringify(obj));
    clone.racer = racer;
    clone.team = team;
    return new AppText(clone.id, clone);
  }

  static fromTwilio(id: TextId, twilio: TwilioInboundText) {
    let p = {};

    let messageWithoutHeader = twilio.Body.substring(APP_TEXT_HEADER.length + 1);
    let parsedAppMessage = JSON.parse(messageWithoutHeader);

    
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

//example outbound text
/*
{
  sid: 'SMce867b3405184c9cbea304e08cfb8442',
  date_created: 'Thu, 06 Oct 2016 20:59:10 +0000',
  date_updated: 'Thu, 06 Oct 2016 20:59:10 +0000',
  date_sent: null,
  account_sid: 'ACec0228fea72a5c90af0ca1545c7d0c33',
  to: '+447933088245',
  from: '+441480706126',
  messaging_service_sid: null,
  body: 'Sent from your Twilio trial account - rekfbref',
  status: 'queued',
  num_segments: '1',
  num_media: '0',
  direction: 'outbound-api',
  api_version: '2010-04-01',
  price: null,
  price_unit: 'USD',
  error_code: null,
  error_message: null,
  uri: '/2010-04-01/Accounts/ACec0228fea72a5c90af0ca1545c7d0c33/Messages/SMce867b3405184c9cbea304e08cfb8442.json',
  subresource_uris: { media: '/2010-04-01/Accounts/ACec0228fea72a5c90af0ca1545c7d0c33/Messages/SMce867b3405184c9cbea304e08cfb8442/Media.json' },
  dateCreated: Thu Oct 06 2016 21:59:10 GMT+0100 (BST),
  dateUpdated: Thu Oct 06 2016 21:59:10 GMT+0100 (BST),
  dateSent: null,
  accountSid: 'ACec0228fea72a5c90af0ca1545c7d0c33',
  messagingServiceSid: null,
  numSegments: '1',
  numMedia: '0',
  apiVersion: '2010-04-01',
  priceUnit: 'USD',
  errorCode: null,
  errorMessage: null,
  subresourceUris: { media: '/2010-04-01/Accounts/ACec0228fea72a5c90af0ca1545c7d0c33/Messages/SMce867b3405184c9cbea304e08cfb8442/Media.json' } }
};*/
