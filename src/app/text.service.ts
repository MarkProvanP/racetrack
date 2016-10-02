import { Injectable } from "@angular/core";
import { Headers, Http } from "@angular/http";
import 'rxjs/add/operator/toPromise';

import { Text, PhoneNumber } from '../common/text';
import { TextReceivedMessage } from "../common/message";

type textCallback = (Text) => void;
@Injectable()
export class TextService {
  
  private headers = new Headers({'Content-Type': 'application/json'});
  private backendHost = "https://mrp4.host.cs.st-andrews.ac.uk";
  private baseUrl = this.backendHost + "/r2bcknd/";
  private textsUrl = this.baseUrl + "texts";

  private socket;

  private textReceivers: [textCallback] = <[textCallback]>[];

  constructor(private http: Http) {
    this.socket = io(this.backendHost, {path: '/r2bcknd/socket.io'});
    this.socket.on(TextReceivedMessage.event, (messageString) => {
      let parsed = JSON.parse(messageString);
      let message = TextReceivedMessage.fromJSON(parsed);
      console.log('Received message', message);
      let text = message.text;
      this.textReceivers.forEach(receiver => receiver(text));
    });
  }

  onTextReceived(callback: textCallback) {
    this.textReceivers.push(callback);
  }

  getTexts(): Promise<[Text]> {
    return this.http.get(this.textsUrl)
      .toPromise()
      .then(response => response.json()
            .map(text => Text.fromJSON(text)))
      .catch(this.handleError);
  }

  updateText(text: Text): Promise<Text> {
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
