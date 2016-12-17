const APP_TEXT_HEADER = "!AutoUpdate!";

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
import { MessageSender } from "./server";
import { User } from "./auth";

import * as winston from "winston";
import * as uuid from "node-uuid";

let singleton;

export function GetDataIntermediary(
  dbFacade: DbFacadeInterface,
  messageSender: MessageSender
) {
  if (!singleton) {
    singleton = new DataIntermediary(dbFacade, messageSender);
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
    private messageSender: MessageSender
  ) {}

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

  public createRacer(name: string): Promise<Racer> {
    let id = uuid.v4();
    let newRacer = new Racer(id, name);
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

  createTeam(name: string): Promise<Team> {
    let id = uuid.v4();
    let newTeam = new Team(id, name);
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

  private populateText(text: DbFormText): Promise<FullFormText> {
    return this.addRacerToText(text)
    .catch(err => {
      console.error(`addracertotext failed`);
      return Promise.reject(err);
    })
    .then(textWithRacer => this.addTeamToText(textWithRacer))
    .catch(err => {
      console.error(`addTeamToText failed populateText(${this.shortDebugText(text)})`, err);
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
    let id = uuid.v4();
    let createdText;

    if (text.Body.indexOf(APP_TEXT_HEADER) == 0) {
      createdText = AppText.fromTwilio(id, text);
    } else {
      createdText = InboundText.fromTwilio(id, text);
    }

    let fromNumber = createdText.from;
    return this.getRacers()
      .then(racers => {
        let matchingRacers = racers.filter(
          racer => racer.phones.filter(contact => contact.number == fromNumber).length);
        if (matchingRacers.length > 0) {
          createdText.racer = matchingRacers[0];
        } else {
        }
        return this.getTeams()
      })
      .then(teams => {
        let matchingTeams = teams
          .filter(team =>
            team.racers.filter(racer => createdText.racer && racer.id == createdText.racer.id).length > 0);
        if (matchingTeams.length > 0) {
          createdText.team = matchingTeams[0];
        }
      })
      .then(result => {
        return this.dbFacade.createText(createdText.toDbForm());
      })
      .then(result => {
        let newMessage = new TextReceivedMessage(createdText);
        this.messageSender.sendMessageToWebClients(newMessage);
        return Promise.resolve(createdText)
      })
      .catch(err => {
        console.error(`addTextFromTwilio(${this.shortDebugTwilioInboundText(text)})`, err);
        return Promise.reject(err);
      })
  }

  public addNewSentText(text: TwilioOutboundText, user: UserWithoutPassword): Promise<Text> {
    let id = uuid.v4();
    let createdText = OutboundText.fromTwilio(id, text);
    createdText.sentBy = {
      user: user,
      timestamp: new Date()
    }
    let toNumber = createdText.to;
    return this.getRacers()
      .then(racers => {
        let matchingRacers = racers.filter(
          racer => racer.phones.filter(contact => contact.number == toNumber).length);
        if (matchingRacers.length > 0) {
          createdText.racer = matchingRacers[0];
        } else {
        }
        return this.getTeams()
      })
      .then(teams => {
        let matchingTeams = teams
          .filter(team =>
            team.racers.filter(racer => createdText.racer && racer.id == createdText.racer.id).length);
        if (matchingTeams.length) {
          createdText.team = matchingTeams[0];
        }
      })
      .then(result => {
        return this.dbFacade.createText(createdText.toDbForm());
      })
      .then(result => {
        let newMessage = new TextSentMessage(createdText);
        this.messageSender.sendMessageToWebClients(newMessage);
        return Promise.resolve(createdText)
      });
  }

  private addRacerToText(text: DbFormText): Promise<any> {
    let copy = JSON.parse(JSON.stringify(text));
    let inbound = text.text_subclass == "InboundText" || text.text_subclass == "AppText";
    return this.getRacers()
      .then(racers => {
        let possibleRacers = racers
          .filter(racer => {
            return racer.phones.filter(contact => {
              if (inbound) {
                return contact.number == text.from;
              } else {
                return contact.number == text.to;
              }
            }).length
          });
        if (possibleRacers.length > 0) {
          copy.racer = possibleRacers[0];
        }
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
      copy.team = teams.filter(team => team.racers.filter(racer => text.racer && racer.id == text.racer.id).length)[0];
      return Promise.resolve(copy);
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
    .then(user => Promise.resolve(user == null))
  }

  addUser(username, password, properties): Promise<User> {
    let user = User.createWithPassword(username, password, properties);
    return this.dbFacade.createUser(user)
      .then(result => {
        return Promise.resolve(user);
      });
  }

  updateUser(user): Promise<User> {
    return this.dbFacade.updateUser(user)
    .then(res => user);
  }

  deleteUser(username: UserId): Promise<void> {
    return this.dbFacade.deleteUser(username)
  }
}

