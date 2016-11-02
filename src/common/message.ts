import { Text } from "./text";

import { UserWithoutPassword } from "./user";

export abstract class AbstractMessage {
  messageType: string;

  static fromJSON(obj): AbstractMessage {
    if (obj.messageType == TextReceivedMessage.event) {
      return TextReceivedMessage.fromJSON(obj);
    } else if (obj.messageType == UserLoggedInMessage.event) {
      return UserLoggedInMessage.fromJSON(obj);
    } else if (obj.messageType == UserLoggedOutMessage.event) {
      return UserLoggedOutMessage.fromJSON(obj);
    }
  }

  getEvent() {
    return this.messageType;
  }
}

export class TextReceivedMessage extends AbstractMessage {
  static event: string = "text-received";
  messageType = TextReceivedMessage.event;

  static fromJSON(obj) {
    let text = Text.fromJSON(obj.text);
    return new TextReceivedMessage(text);
  }

  constructor(private text: Text) {
    super();
  }
}

export class UserLoggedInMessage extends AbstractMessage {
  static event: string = "user-logged-in";
  messageType = UserLoggedInMessage.event;
  constructor(private user: UserWithoutPassword) {
    super();
  }
  static fromJSON(obj) {
    return new UserLoggedInMessage(obj.user);
  }
}

export class UserLoggedOutMessage extends AbstractMessage {
  static event: string = "user-logged-out";
  messageType = UserLoggedOutMessage.event;
  constructor(private user: UserWithoutPassword) {
    super();
  }
  static fromJSON(obj) {
    return new UserLoggedOutMessage(obj.user);
  }
}
