let generatePassword = require("password-generator");

import { DbFacadeInterface} from "./db/db-facade";
import {
  Racer,
  DbFormRacer,
  RacerId
} from "../common/racer";
import {
  Team,
  DbFormTeam,
  TeamId,
  UnpopulatedTeam,
  PopulatedTeam
} from "../common/team";
import {
  TeamUpdate,
  TeamUpdateId,
  DbFormTeamUpdate
} from "../common/update";
import {
  Text,
  TextId,
  DbFormText,
  PhoneNumber,
  InboundText,
  OutboundText,
  AppText,
  TwilioInboundText,
  TwilioOutboundText,
  FullFormText,
} from "../common/text";
import { UserWithoutPassword, UserId } from "../common/user";
import {
  TextReceivedMessage,
  TextSentMessage,
  TextUpdatedMessage,
  RacerUpdatedMessage,
  TeamUpdatedMessage,
  TeamUpdateUpdatedMessage
} from "../common/message";
import { Emailer, MessageSender } from "./server";
import { User } from "./auth";

import * as winston from "winston";
import * as uuid from "uuid";

export interface SavedConfig {
  nodemailer: {
    accessToken: string;
  }
}

let singleton;

export function GetDataIntermediary(
  dbFacade: DbFacadeInterface,
  messageSender: MessageSender,
  emailer: Emailer
) {
  if (!singleton) {
    singleton = new DataIntermediary(dbFacade, messageSender, emailer);
  }
  return singleton;
}

function trace(s, obj) {
  console.log(s, obj);
  return obj;
}

export class DataIntermediary {
  constructor(
    private dbFacade: DbFacadeInterface,
    private messageSender: MessageSender,
    private emailer: Emailer
  ) {}

  getSavedConfig(): Promise<SavedConfig> {
    return this.dbFacade.getSavedConfig()
  }

  createSavedConfig(): Promise<SavedConfig> {
    let savedConfig = {
      nodemailer: {
        accessToken: ""
      }
    }
    return this.dbFacade.createSavedConfig(savedConfig)
    .then(res => savedConfig);
  }

  updateSavedConfig(newConfig: SavedConfig): Promise<void> {
    return this.dbFacade.updateSavedConfig(newConfig)
  }
//================================================================

  public getRacers(): Promise<Racer[]> {
    return this.dbFacade.getRacers({})
    .then(racers => racers.map(racer => Racer.fromJSON(racer)));
  }

  public getRacer(id: RacerId): Promise<Racer> {
    return this.dbFacade.getRacer({id})
    .then(racer => Racer.fromJSON(racer))
  }

  public updateRacer(racer: Racer, user?: UserWithoutPassword): Promise<Racer> {
    return this.dbFacade.updateRacer(racer.toDbForm())
    .then(() => {
      if (user) {
        let newMessage = new RacerUpdatedMessage(racer, user);
        this.messageSender.sendMessageToWebClients(newMessage);
      }
      return racer;
    });
  }

  public createRacer(properties): Promise<Racer> {
    let id = properties.id ? properties.id : uuid.v4();
    let newRacer = new Racer(id, properties);
    return this.dbFacade.createRacer(newRacer.toDbForm())
      .then(r => newRacer);
  }

  public deleteRacer(id: RacerId) {
    return this.dbFacade.deleteRacer(id);
  }

//================================================================

  getTeams(): Promise<Team[]> {
    return this.dbFacade.getTeams({})
    .then(docs => {
      let teams = docs as [UnpopulatedTeam];
      let teamPromises = teams.map(team => this.populateTeam(team).catch(err => {
        console.error(`error populating team ${team} in getTeams() teamPromises`, err);
        throw err;
      }));
      return Promise.all(teamPromises)
        .then(teams => teams.map(team => Team.fromJSON(team)));
    })
    .catch(err => {
      console.error(`getTeams()`, err);
      throw err;
    })
  }

  private populateTeam(team: UnpopulatedTeam): Promise<PopulatedTeam> {
    let updatePromises = team.statusUpdates
      .map(update => this.getStatusUpdate(update));
    let racerPromises = team.racers
      .map(racer => this.getRacer(racer));
    let copy = JSON.parse(JSON.stringify(team));
    return Promise.all(updatePromises)
      .then((statuses: TeamUpdate[]) => {
        copy.statusUpdates = statuses;
        return Promise.all(racerPromises)
          .then((racers: Racer[]) => {
            copy.racers = racers;
            return Promise.resolve(copy);
          });
      });
  }

  getTeam(id: TeamId): Promise<Team> {
    return this.dbFacade.getTeams({id})
      .then(docs => {
        if (docs.length > 0) {
          let unpopulatedTeam = docs[0];
          return this.populateTeam(unpopulatedTeam)
            .then(team => Promise.resolve(Team.fromJSON(team)));
        } else {
          return Promise.resolve(undefined);
        }
    });
  }

  updateTeam(team: Team, user?: UserWithoutPassword): Promise<Team> {
    let depopulatedTeam = team.depopulate();
    return this.dbFacade.updateTeam(depopulatedTeam)
      .then(result => {
        if (user) {
          let newMessage = new TeamUpdatedMessage(team, user);
          this.messageSender.sendMessageToWebClients(newMessage);
        }
        return team;
    });
  }

  createTeam(properties): Promise<Team> {
    let id = properties.id ? properties.id : uuid.v4();
    let newTeam = new Team(id, properties);
    return this.dbFacade.createTeam(newTeam.depopulate())
      .then(result => {
        return Promise.resolve(newTeam);
      });
  }

  deleteTeam(id: TeamId): Promise<any> {
    return this.dbFacade.deleteTeam(id)
      .then(result => {
        return Promise.resolve();
      });
  }

//================================================================
  
  private shortDebugText(text: Text | DbFormText) {
    return `{id: ${text.id}, body: ${text.body}}`;
  }
  private shortDebugTwilioInboundText(text: TwilioInboundText) {
    return `{SmsSid: ${text.SmsSid}, Body: ${text.Body}}`;
  }

  public getTexts(): Promise<Text[]> {
    return this.dbFacade.getTexts({})
    .then(texts => this.getTextsReady(texts))
    .catch(err => {
      console.error('getTexts()', err);
      return Promise.reject(err);
    });
  }

  public getTextsByNumber(phone: PhoneNumber): Promise<Text[]> {
    return this.dbFacade.getTexts({from: phone})
    .then(texts => this.getTextsReady(texts))
    .catch(err => {
      console.error(`getTextsByNumber(${phone})`, err);
      return Promise.reject(err);
    })
  }

  private getTextsReady(texts: DbFormText[]): Promise<Text[]> {
    let textPromises = texts.map(text => this.populateText(text));
    return Promise.all(textPromises)
      .then(texts => texts.map(text => Text.fromJSON(text)))
      .catch(err => {
        console.error(`getTextsReady(${texts.map(text => this.shortDebugText(text))})`, err);
        throw err;
      })
  }

  public updateText(text: Text, user?: UserWithoutPassword): Promise<Text> {
    let textInDbForm = text.toDbForm();
    return this.dbFacade.updateText(textInDbForm)
    .then(t => {
      let newMessage = new TextUpdatedMessage(text);
      this.messageSender.sendMessageToWebClients(newMessage);
      return text;
    })
    .catch(err => {
      console.error(`updateText(${this.shortDebugText(text)}, ${user}})`, err);
      throw err;
    })
  }

  public addTextFromTwilio(text: TwilioInboundText): Promise<Text> {
    this.emailer.sendTextReceivedEmail(text);
    let id = uuid.v4();
    let createdText = AppText.isAppText(text) ? AppText.fromTwilio(id, text) : InboundText.fromTwilio(id, text);
    let inDbForm = createdText.toDbForm();

    return this.dbFacade.createText(inDbForm)
    .then(addedToDb => this.populateText(inDbForm))
    .then(populatedText => {
      let text = Text.fromJSON(populatedText);
      let newMessage = new TextReceivedMessage(text);
      this.messageSender.sendMessageToWebClients(newMessage);
      return text;
    })
    .catch(err => {
      console.error(`addTextFromTwilio(${this.shortDebugTwilioInboundText(text)})`, err);
      return Promise.reject(err);
    })
  }

  public addNewSentText(text: TwilioOutboundText, user: UserWithoutPassword): Promise<Text> {
    this.emailer.sendTextSentEmail(text);
    let id = uuid.v4();
    let createdText = OutboundText.fromTwilio(id, text);
    createdText.sentBy = {
      user: user,
      timestamp: new Date()
    }
    let inDbForm = createdText.toDbForm();
    return this.dbFacade.createText(inDbForm)
    .then(addedToDb => this.populateText(inDbForm))
    .then(populatedText => {
      let text = Text.fromJSON(populatedText)
      let newMessage = new TextSentMessage(text);
      this.messageSender.sendMessageToWebClients(newMessage);
      return text 
    });
  }

  private populateText(text: DbFormText): Promise<FullFormText> {
    return this.addRacerToText(text)
    .catch(err => {
      console.error(`addRacerToText failed`);
      return Promise.reject(err);
    })
    .then(textWithRacer => this.addTeamToText(textWithRacer))
    .catch(err => {
      console.error(`addTeamToText failed populateText(${this.shortDebugText(text)})`, err);
      return Promise.reject(err);
    })
  }


  private addRacerToText(text): Promise<any> {
    let copy = JSON.parse(JSON.stringify(text));
    let inbound = text.text_subclass == "InboundText" || text.text_subclass == "AppText";
    let checkNumber = inbound ? text.from : text.to;
    return this.getRacers()
      .then(racers => {
        let possibleRacers = racers.filter(racer => racer.hasPhoneNumber(checkNumber));
        copy.racer = possibleRacers.length ? possibleRacers[0] : undefined;
        return copy;
      })
      .catch(err => {
        console.error(`addRacerToText(${this.shortDebugText(text)})`, err);
        return Promise.reject(err);
      })
  }

  private addTeamToText(text): Promise<any> {
    let copy = JSON.parse(JSON.stringify(text));
    return this.getTeams()
    .then(teams => {
      let possibleTeams = teams.filter(team => team.hasRacer(text.racer));
      copy.team = possibleTeams.length ? possibleTeams[0] : undefined;
      return copy;
    })
    .catch(err => {
      console.error(`addTeamToText(${this.shortDebugText(text)}) after adding teams`, err);
      return Promise.reject(err);
    });
  }

//================================================================

  createStatusUpdate(properties): Promise<TeamUpdate> {
    let id = uuid.v4();
    let newStatusUpdate = new TeamUpdate(id, properties);
    return this.dbFacade.createTeamUpdate(newStatusUpdate)
      .then(result => {
        return Promise.resolve(newStatusUpdate);
      });
  }

  getStatusUpdates(): Promise<TeamUpdate[]> {
    return this.dbFacade.getTeamUpdates({})
      .then(docs => {
        let updates = docs;
        return Promise.resolve(updates);
      });
  }

  getStatusUpdate(id: TeamUpdateId): Promise<TeamUpdate> {
    return this.dbFacade.getTeamUpdates({id})
      .then(docs => {
        let update = docs[0];
        return Promise.resolve(update);
      });
  }

  updateTeamUpdate(update: TeamUpdate, user?: UserWithoutPassword): Promise<TeamUpdate> {
    return this.dbFacade.updateTeamUpdate(update)
    .then(r => {
      if (user) {
        let newMessage = new TeamUpdateUpdatedMessage(update, user);
        this.messageSender.sendMessageToWebClients(newMessage);
      }
      return update;
    })
  }
  
  deleteTeamUpdate(id: TeamUpdateId): Promise<void> {
    return this.dbFacade.deleteTeamUpdate(id);
  }

//================================================================
  getUser(username): Promise<User> {
    return this.dbFacade.getUser({username})
      .then(user => User.fromJSON(user));
  }

  getUsers(): Promise<User[]> {
    return this.dbFacade.getUsers({})
      .then(users => users.map(user => User.fromJSON(user)));
  }

  canAddUser(username): Promise<boolean> {
    return this.getUser(username)
    .catch(doesntExist => Promise.resolve(null))
    .then(user => {
      return Promise.resolve(user == null)
    })
  }

  addUserWithPassword(username, password, properties): Promise<User> {
    let user = User.createWithPassword(username, password, properties);
    return this.dbFacade.createUser(user)
    .then(res => user)
    .then(res => this.emailer.sendUserCreatedEmail(user, password))
    .then(mailResult => user);
  }

  addUser(username, properties): Promise<User> {
    let newPassword = generatePassword();
    return this.addUserWithPassword(username, newPassword, properties);
  }

  resetUserPassword(username): Promise<User> {
    let newPassword = generatePassword();
    let user;
    return this.getUser(username)
    .then(user => user.changePassword(newPassword, true))
    .then(changed => this.updateUser(changed))
    .then(changed => {
      user = changed;
      let userEmail = user.email;
      return this.emailer.sendPasswordResetEmail(userEmail, newPassword);
    })
    .then(messageInfo => user)
  }

  changeUserPassword(username, newPassword): Promise<User> {
    return this.getUser(username)
    .then(user => user.changePassword(newPassword))
    .then(changed => this.updateUser(changed))
  }

  updateUser(user): Promise<User> {
    return this.dbFacade.updateUser(user)
    .then(res => user);
  }

  deleteUser(username: UserId): Promise<void> {
    return this.dbFacade.deleteUser(username)
  }
}

