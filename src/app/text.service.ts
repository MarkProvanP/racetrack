import { Injectable } from "@angular/core";
import { Headers, Http } from "@angular/http";
import 'rxjs/add/operator/toPromise';

import { Text, PhoneNumber, InboundText, OutboundText } from '../common/text';
import { Racer } from '../common/racer';
import { Team } from '../common/team';
import { TextReceivedMessage } from "../common/message";

export class TextFilterOptions {
  racer: Racer;
  team: Team;
  read: boolean

  constructor(opts) {
    this.racer = opts.racer;
    this.team = opts.team;
    this.read = opts.read;
  }

  filter(text: Text): boolean {
    if (this.racer !== undefined) {
      if (this.racer === true) { if (!text.racer) return false }
      if (!text.racer || text.racer.id != this.racer.id) return false;
    }
    if (this.team !== undefined) {
      if (this.team === true) { if (!text.team) return false }
      if (!text.team || text.team.id != this.team.id) return false;
    }
    if (text instanceof InboundText && this.read != undefined) {
      if ((<InboundText> text).read != this.read) return false;
    }
    if (text instanceof OutboundText && this.read != undefined) {
      return false;
    }
    return true;
  }
}

type textCallback = (Text) => void;
@Injectable()
export class TextService {
  
  private headers = new Headers({'Content-Type': 'application/json'});
  private backendHost = "";
  private socketIoHost = "https://mrp4.host.cs.st-andrews.ac.uk";
  private baseUrl = this.backendHost + "/r2bcknd/";
  private textsUrl = this.baseUrl + "texts";

  private socket;

  private texts: Text[] = [];

  private onTextsChangedReceivers = [];
  private onTextReceivedReceivers = [];

  constructor(private http: Http) {
    this.socket = io(this.socketIoHost, {path: '/r2bcknd/socket.io'});
    this.getAllTextsFromBackend()
      .then(texts => {
        this.texts = texts
        this.broadcastTextsChanged();
      });
    this.socket.on(TextReceivedMessage.event, (messageString) => {
      let parsed = JSON.parse(messageString);
      let message = TextReceivedMessage.fromJSON(parsed);
      console.log('Received message', message);
      let text = message.text;
      this.broadcastTextReceived(text);
      this.addText(text);
    });
  }

  private addText(text: Text): Promise<Text> {
    this.texts.push(text);
    this.broadcastTextsChanged();
    return Promise.resolve(text);
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
    return this.http.get(this.textsUrl)
      .toPromise()
      .then(response => response.json()
            .map(text => Text.fromJSON(text)))
      .catch(this.handleError);
  }

  updateText(text: Text): Promise<Text> {
    // Find this text in the TextService local cache
    let foundIndex;
    for (let i = 0; i < this.texts.length; i++) {
      if (this.texts[i].id == text.id) {
        foundIndex = i;
        break;
      }
    }
    if (foundIndex) {
      this.texts[foundIndex] = text;
    }
    return this.writeTextToBackend(text);
  }

  private writeTextToBackend(text: Text): Promise<Text> {
    const url = `${this.textsUrl}/${text.id}`;
    return this.http
      .put(url, JSON.stringify(text), {headers: this.headers})
      .toPromise()
      .then(response => {
        let t = Text.fromJSON(response.json());
        return t;
      })
      .catch(this.handleError);
  }

  sendText(to: PhoneNumber, message: string): Promise<OutboundText> {
    let text = {
      to: to,
      message: message
    };
    return this.http
      .post(this.textsUrl, JSON.stringify(text), {headers: this.headers})
      .toPromise()
      .then(response => OutboundText.fromJSON(response.json()))
      .then(text => this.addText(text))
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }
}
