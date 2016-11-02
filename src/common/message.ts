import { Text } from "./text";

import { UserWithoutPassword } from "./user";

export abstract class AbstractMessage {
  messageType: string;

  static fromJSON(obj): AbstractMessage {
    if (obj.messageType == TextReceivedMessage.event) {
      return TextReceivedMessage.fromJSON(obj);
    } else if (obj.messageType == TextSentMessage.event) {
      return TextSentMessage.fromJSON(obj);
    } else if (obj.messageType == TextUpdatedMessage.event) {
      return TextUpdatedMessage.fromJSON(obj);
    } else if (obj.messageType == OtherLoggedInUsersMessage.event) {
      return OtherLoggedInUsersMessage.fromJSON(obj);
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

export class TextUpdatedMessage extends AbstractMessage {
  static event: string = "text-updated";
  messageType = TextUpdatedMessage.event;

  static fromJSON(obj) {
    let text = Text.fromJSON(obj.text);
    return new TextUpdatedMessage(text);
  }

  constructor(private text: Text) {
    super();
  }
}

export class TextSentMessage extends AbstractMessage {
  static event: string = "text-sent";
  messageType = TextSentMessage.event;

  static fromJSON(obj) {
    let text = Text.fromJSON(obj.text);
    return new TextSentMessage(text);
  }

  constructor(private text: Text) {
    super();
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

export class OtherLoggedInUsersMessage extends AbstractMessage {
  static event: string = "other-logged-in-users";
  messageType = OtherLoggedInUsersMessage.event;
  constructor(private users: UserWithoutPassword[]) {
    super();
  }
  static fromJSON(obj) {
    return new OtherLoggedInUsersMessage(obj.users);
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
