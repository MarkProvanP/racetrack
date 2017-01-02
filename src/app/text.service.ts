import { Injectable } from "@angular/core";
import { Headers, Http } from "@angular/http";
import 'rxjs/add/operator/toPromise';
import { MdSnackBar, MdSnackBarConfig } from "@angular/material";

import { Text, TextId, PhoneNumber, InboundText, OutboundText } from '../common/text';
import { Racer } from '../common/racer';
import { Team } from '../common/team';
import { TextReceivedMessage, TextUpdatedMessage, TextSentMessage } from "../common/message";
import { UserService } from './user.service';

import * as moment from "moment";

export class TextFilterOptions {
  hasRacer: boolean;
  racer: Racer;
  hasTeam: boolean;
  team: Team;
  read: boolean
  inbound: boolean;
  outbound: boolean;
  afterTime: Date;
  beforeTime: Date;
  textIds: TextId[];

  constructor(opts) {
    this.hasRacer = opts.hasRacer;
    this.racer = opts.racer;
    this.hasTeam = opts.hasTeam;
    this.team = opts.team;
    this.read = opts.read;
    this.inbound = opts.inbound;
    this.outbound = opts.outbound;
    this.afterTime = opts.afterTime;
    this.beforeTime = opts.beforeTime;
    this.textIds = opts.textIds || [];
  }

  filter(text: Text): boolean {
    if (this.racer !== undefined) {
      if (this.hasRacer) { if (!text.racer) return false }
      if (!text.racer || text.racer.id != this.racer.id) return false;
    }
    if (this.team !== undefined) {
      if (this.hasTeam) { if (!text.team) return false }
      if (!text.team || text.team.id != this.team.id) return false;
    }
    if (text instanceof InboundText && this.read != undefined) {
      if (!!(<InboundText> text).readBy != this.read) return false;
    }
    if (text instanceof OutboundText && this.read != undefined) {
      return false;
    }
    if (this.inbound !== undefined) {
      if (text instanceof InboundText != this.inbound) return false;
    }
    if (this.outbound !== undefined) {
      if (text instanceof OutboundText != this.outbound) return false;
    }
    if (this.afterTime !== undefined) {
      if (moment(text.timestamp).isBefore(this.afterTime)) return false;
    }
    if (this.beforeTime !== undefined) {
      if (moment(text.timestamp).isAfter(this.beforeTime)) return false;
    }
    if (this.textIds !== undefined && this.textIds.length) {
      if (this.textIds.indexOf(text.id) == -1) return false;
    }
    return true;
  }
}

type textCallback = (Text) => void;
@Injectable()
export class TextService {
  private headers = new Headers({'Content-Type': 'application/json'});
  private httpExtras = {
    headers: this.headers,
    withCredentials: true
  }

  private backendHost = "";
  private baseUrl = this.backendHost + "/r2bcknd/";
  private textsUrl = this.baseUrl + "texts";

  private texts: Text[] = [];

  private onTextsChangedReceivers = [];
  private onTextReceivedReceivers = [];

  private whenAuthenticated() {
    this.getAllTextsFromBackend()
      .then(texts => {
        this.texts = texts
        this.broadcastTextsChanged();
      });
    this.userService.addSocketEventListener(TextReceivedMessage.event, (message) => {
      let textReceivedMessage = TextReceivedMessage.fromJSON(message);
      let text = textReceivedMessage.text;
      this.broadcastTextReceived(text);
      this.addText(text);
    });
    this.userService.addSocketEventListener(TextSentMessage.event, (message) => {
      let textSentMessage = TextReceivedMessage.fromJSON(message);
      let text = textSentMessage.text;
      this.addText(text)
      this.broadcastTextsChanged();
    });
    this.userService.addSocketEventListener(TextUpdatedMessage.event, (message) => {
      console.log(message);
      let textReadMessage = TextUpdatedMessage.fromJSON(message);
      let text = textReadMessage.text;
      console.log(textReadMessage, text);
      this.updateTextLocally(text);
      this.broadcastTextsChanged();
    })
  }

  private notAuthenticated() {
    this.texts = [];
  }

  constructor(
    private http: Http,
    private userService: UserService,
    private snackBar: MdSnackBar
  ) {
    this.userService.addOnAuthStatusChangedListener(authenticated => {
      console.log('authenticated status changed to', authenticated);
      if (authenticated) {
        this.whenAuthenticated();
      } else {
        this.notAuthenticated();
      }
    });
  }

  private addText(text: Text): Promise<Text> {
    this.texts.push(text);
    this.broadcastTextsChanged();
    return Promise.resolve(text);
  }

  private updateTextLocally(text: Text) {
    for (let i = 0; i < this.texts.length; i++) {
      let t = this.texts[i];
      if (t.id == text.id) {
        this.texts[i] = text;
        return;
      }
    }
  }

  updateTextAndWriteToBackend(text: Text): Promise<Text> {
    this.updateTextLocally(text);
    return this.writeTextToBackend(text);
  }


  addTextsChangedCallback(callback: Function) {
    this.onTextsChangedReceivers.push(callback);
  }

  addTextReceivedCallback(callback: Function) {
    this.onTextReceivedReceivers.push(callback);
  }

  private broadcastTextsChanged() {
    this.onTextsChangedReceivers.forEach(callback => callback(this.texts));
  }

  private broadcastTextReceived(text: Text) {
    this.onTextReceivedReceivers.forEach(callback => callback(text));
  }

  getAllTexts(): Text[] {
    return this.texts;
  }

  getTextsFiltered(options: TextFilterOptions) {
    return this.texts.filter(text => options.filter(text));
  }

  private getAllTextsFromBackend(): Promise<Text[]> {
    return this.http.get(this.textsUrl, this.httpExtras)
    .toPromise()
    .then(response => response.json()
    .map(text => Text.fromJSON(text)))
    .catch(this.handleError)
    .catch(err => {
      console.error("Error getting all texts from backend, leaving no texts")
      return [];
    })
  }

  private writeTextToBackend(text: Text): Promise<Text> {
    const url = `${this.textsUrl}/${text.id}`;
    return this.http
      .put(url, JSON.stringify(text), this.httpExtras)
      .toPromise()
      .then(response => {
        let t = Text.fromJSON(response.json());
        return t;
      })
      .catch(this.handleError);
  }

  sendText(to: PhoneNumber, message: string): Promise<OutboundText> {
    let user = this.userService.getUser();
    let text = {
      to: to.toE164(),
      message: message,
      user: user
    };
    return this.http
      .post(this.textsUrl, JSON.stringify(text), this.httpExtras)
      .toPromise()
      .then(response => OutboundText.fromJSON(response.json()))
      .then(text => this.addText(text))
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    this.snackBar.open('A Text Service error occured!', 'Dismiss')
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }
}
