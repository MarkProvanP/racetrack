import { Injectable } from "@angular/core";
import { Headers, Http } from "@angular/http";
import 'rxjs/add/operator/toPromise';

import { Text, PhoneNumber } from '../common/text';
import { TextReceivedMessage } from "../common/message";

export class TextFilterOptions {
  racer: Racer,
  team: Team,
  read: boolean

  constructor(opts) {
    this.racer = opts.racer;
    this.team = opts.team;
    this.read = opts.read;
  }

  filter(text: Text): boolean {
    if (this.racer !+ undefined) {
      if (text.racer.id != this.racer.id) return false;
    }
    if (this.team != undefined) {
      if (text.team.id != this.team.id) return false;
    }
    if (this.read != undefined) {
      if (text.read != this.read) return false;
    }
    return true;
  }
}

type textCallback = (Text) => void;
@Injectable()
export class TextService {
  
  private headers = new Headers({'Content-Type': 'application/json'});
  private backendHost = "https://mrp4.host.cs.st-andrews.ac.uk";
  private baseUrl = this.backendHost + "/r2bcknd/";
  private textsUrl = this.baseUrl + "texts";

  private socket;

  private texts: Text[] = [];

  private onTextsChangedReceivers: [Function] = [];

  constructor(private http: Http) {
    this.socket = io(this.backendHost, {path: '/r2bcknd/socket.io'});
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
      this.addText(text);
    });
  }

  private addText(text: Text) {
    this.texts.push(text);
    this.broadcastTextsChanged();
  }

  addTextsChangedCallback(callback: Function) {
    this.onTextsChangedReceivers.push(callback);
  }

  private broadcastTextsChanged() {
    this.onTextsChangedReceivers.forEach(callback => callback(this.texts));
  }

  getAllTexts(): Text[] {
    return this.texts;
  }

  getTextsFiltered(options: TextFilterOptions) {
    return this.texts.filter(text => options.filter(text));
  }

  private getAllTextsFromBackend(): Promise<[Text]> {
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
}
