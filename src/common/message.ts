import { Text } from "./text";
import { Team } from "./team";
import { Racer } from "./racer";
import { TeamUpdate } from "./update";
import { UserWithoutPassword } from "./user";

export const CLOSE_SOCKET = "close-socket";

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
    } else if (obj.messageType == TeamUpdatedMessage.event) {
      return TeamUpdatedMessage.fromJSON(obj);
    } else if (obj.messageType == RacerUpdatedMessage.event) {
      return RacerUpdatedMessage.fromJSON(obj);
    } else if (obj.messageType == TeamUpdateUpdatedMessage.event) {
      return TeamUpdateUpdatedMessage.fromJSON(obj);
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

  constructor(public text: Text) {
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

  constructor(public text: Text) {
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

  constructor(public text: Text) {
    super();
  }
}

export class OtherLoggedInUsersMessage extends AbstractMessage {
  static event: string = "other-logged-in-users";
  messageType = OtherLoggedInUsersMessage.event;
  constructor(public users: UserWithoutPassword[]) {
    super();
  }
  static fromJSON(obj) {
    let users = obj.users.map(user => UserWithoutPassword.fromJSON(user));
    return new OtherLoggedInUsersMessage(users);
  }
}

export class UserLoggedInMessage extends AbstractMessage {
  static event: string = "user-logged-in";
  messageType = UserLoggedInMessage.event;
  constructor(public user: UserWithoutPassword) {
    super();
  }
  static fromJSON(obj) {
    let user = UserWithoutPassword.fromJSON(obj.user);
    return new UserLoggedInMessage(user);
  }
}

export class UserLoggedOutMessage extends AbstractMessage {
  static event: string = "user-logged-out";
  messageType = UserLoggedOutMessage.event;
  constructor(public user: UserWithoutPassword) {
    super();
  }
  static fromJSON(obj) {
    let user = UserWithoutPassword.fromJSON(obj.user);
    return new UserLoggedOutMessage(user);
  }
}

export class TeamUpdatedMessage extends AbstractMessage {
  static event: string = "team-updated";
  messageType = TeamUpdatedMessage.event;
  constructor(public team: Team, public user: UserWithoutPassword) {
    super();
  }
  static fromJSON(obj) {
    let user = UserWithoutPassword.fromJSON(obj.user);
    return new TeamUpdatedMessage(Team.fromJSON(obj.team), user);
  }
}

export class RacerUpdatedMessage extends AbstractMessage {
  static event: string = "racer-updated";
  messageType = RacerUpdatedMessage.event;
  constructor(public racer: Racer, public user: UserWithoutPassword) {
    super();
  }
  static fromJSON(obj) {
    let user = UserWithoutPassword.fromJSON(obj.user);
    return new RacerUpdatedMessage(Racer.fromJSON(obj.racer), user);
  }
}

export class TeamUpdateUpdatedMessage extends AbstractMessage {
  static event: string = "team-update-updated";
  messageType = TeamUpdateUpdatedMessage.event;
  constructor(public update: TeamUpdate, public user: UserWithoutPassword) {
    super();
  }
  static fromJSON(obj) {
    let user = UserWithoutPassword.fromJSON(obj.user);
    return new TeamUpdateUpdatedMessage(TeamUpdate.fromJSON(obj.update), user);
  }
}
