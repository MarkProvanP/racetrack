import { Text } from "./text";

export class TextReceivedMessage {
  static event: string = "text-received";
  text: Text;

  static fromJSON(obj) {
    let text = Text.fromJSON(obj.text);
    return new TextReceivedMessage(text);
  }

  getEvent() {
    return TextReceivedMessage.event;
  }

  constructor(text: Text) {
    this.text = text;
  }
}
