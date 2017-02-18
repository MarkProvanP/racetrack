let generatePassword = require("password-generator");

import { DbFacadeInterface} from "./db/db-facade";
import {
  Racer,
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
  TeamUpdateId
} from "../common/update";
import {
  Text,
  TextId,
  PhoneNumber,
  InboundText,
  OutboundText,
  AppText,
  TwilioInboundText,
  TwilioOutboundText,
  NonNativeText,
  TwilioRecord
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
import { NotFoundError } from "./errors";
import { UserActionInfo } from "../common/user";

import * as winston from "winston";
import * as uuid from "uuid";
import * as _ from "lodash";
import { DOMParser, XMLSerializer } from "xmldom";

let fs = require("fs");
let path = require("path");

const TEAM_MARKER_EXISTING_DIR = path.join(process.cwd(), "src/assets/map-pin/teams");
const TEAM_MARKER_TEMPLATE_FILE = path.join(process.cwd(), "src/assets/map-pin/template-team-marker.svg");
const TEAM_MARKER_TEMPLATE_STRING = fs.readFileSync(TEAM_MARKER_TEMPLATE_FILE, {
  encoding: "utf-8"
});
const XML_PARSER = new DOMParser();
const _TEAM_PIN_TEMPLATE = XML_PARSER.parseFromString(TEAM_MARKER_TEMPLATE_STRING);
function getTeamPinTemplate() {
  let oldDocument = _TEAM_PIN_TEMPLATE;
  let newDocument = oldDocument.implementation.createDocument(
    oldDocument.namespaceURI,
    null,
    null
  );
  let newNode = newDocument.importNode(
    oldDocument.documentElement,
    true
  );
  newDocument.appendChild(newNode);
  return newDocument;
}
const XML_SERIALIZER = new XMLSerializer();

export interface SavedConfig {
  nodemailer: {
    accessToken: string;
  }
}

let singleton;

function arrayToIdObj(a) {
  let obj = {};
  a.forEach(e => {
    obj[e.id] = e;
  })
  return obj;
}

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
    return this.dbFacade.getAllRacers()
    .then(racers => racers.map(racer => Racer.fromJSON(racer)));
  }

  public getRacer(id: RacerId): Promise<Racer> {
    return this.dbFacade.getRacer({id})
    .then(racer => {
      if (!racer) {
        throw new NotFoundError(id, Racer);
      } else {
        return racer;
      }
    })
    .then(racer => Racer.fromJSON(racer))
  }

  public updateRacer(racer: Racer, user?: UserWithoutPassword): Promise<Racer> {
    return this.dbFacade.updateRacer(racer)
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
    return this.dbFacade.createRacer(newRacer)
      .then(r => newRacer);
  }

  public deleteRacer(id: RacerId) {
    return this.dbFacade.deleteRacer(id);
  }

//================================================================

  async getTeams(): Promise<Team[]> {
    let teams = await this.dbFacade.getAllTeams()
    let racerIdsForTeams = teams.map(team => team.racers);
    let allRacerIds = _.flatten(racerIdsForTeams)
    let updateIdsForTeams = teams.map(team => team.statusUpdates);
    let allUpdateIds = _.flatten(updateIdsForTeams);
    let results = await Promise.all([this.dbFacade.getRacers(allRacerIds), this.dbFacade.getTeamUpdates(allUpdateIds)])
    let racersObj = results[0];
    let updatesObj = results[1];
    let populated = teams.map(team => {
      let racers = team.racers.map(racerId => racersObj[racerId]) as Racer[]
      let statusUpdates = team.statusUpdates.map(updateId => updatesObj[updateId]) as TeamUpdate[]
      let clone = JSON.parse(JSON.stringify(team));
      clone.racers = racers;
      clone.statusUpdates = statusUpdates;
      return clone;
    })
    return populated.map(team => Team.fromJSON(team));
  }

  private async populateTeam(team: UnpopulatedTeam): Promise<PopulatedTeam> {
    let updatePromises = team.statusUpdates
      .map(update => this.getStatusUpdate(update));
    let racerPromises = team.racers
      .map(racer => this.getRacer(racer));
    let copy = JSON.parse(JSON.stringify(team));
    let updates = await Promise.all(updatePromises)
    copy.statusUpdates = updates;
    let racers = await Promise.all(racerPromises)
    copy.racers = racers
    return copy
  }

  getTeam(id: TeamId): Promise<Team> {
    return this.dbFacade.getTeam({id})
    .then(team => {
      if (!team) {
        throw new NotFoundError(id, Team);
      } else {
        return team;
      }
    })
    .then(team => this.populateTeam(team))
    .then(team => Team.fromJSON(team))
  }

  updateTeam(team: Team, user?: UserWithoutPassword): Promise<Team> {
    let depopulatedTeam = team.depopulate();
    this.invalidateMapPinForTeam(team.id);
    return this.dbFacade.updateTeam(depopulatedTeam)
    .then(updatedTeam => this.populateTeam(updatedTeam))
    .then(result => {
      let updatedTeam = Team.fromJSON(result)
      if (user) {
        let newMessage = new TeamUpdatedMessage(updatedTeam, user);
        this.messageSender.sendMessageToWebClients(newMessage);
      }
      return updatedTeam;
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
  
  private shortDebugText(text: Text) {
    return `{id: ${text.id}, body: ${text.body}}`;
  }
  private shortDebugTwilioInboundText(text: TwilioInboundText) {
    return `{SmsSid: ${text.SmsSid}, Body: ${text.Body}}`;
  }

  public getText(id: TextId): Promise<Text> {
    return this.dbFacade.getText({id})
    .then(text => {
      if (!text) {
        throw new NotFoundError(id, Text)
      } else {
        return text;
      }
    })
    .then(text => this.populateText(text))
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

  private getTextsReady(texts: Text[]): Promise<Text[]> {
    return this.getTeams()
    .then(teams => {
      let racers = _.flatten(teams.map(team => team.racers))
      let populatedTexts = texts.map(text => {
        let copy = JSON.parse(JSON.stringify(text));
        let checkNumber = Text.isTextOutgoing(text) ? text.to: text.from;
        let possibleRacers = racers.filter(racer => racer.hasPhoneNumber(checkNumber));
        copy.racer = possibleRacers.length ? possibleRacers[0].id : undefined;
        if (copy.racer) {
          let possibleTeams = teams.filter(team => team.hasRacer(copy.racer));
          copy.team = possibleTeams.length ? possibleTeams[0].id : undefined;
        }
        return copy;
      })
      return populatedTexts;
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

  public addNonNativeText(textProperties): Promise<Text> {
    let id = uuid.v4();
    let createdText = new NonNativeText(id, textProperties);
    let inDbForm = createdText.toDbForm();
    return this.dbFacade.createText(inDbForm)
    .then(addedToDb => this.populateText(inDbForm))
    .then(populated => {
      let text = Text.fromJSON(populated);
      let newMessage = new TextReceivedMessage(text);
      this.messageSender.sendMessageToWebClients(newMessage);
      return text;
    })
    .catch(err => {
      console.error(`addNonNativeText${textProperties}`, err);
      return Promise.reject(err);
    })
  }

  public addNewReceivedText(text: TwilioInboundText): Promise<Text> {
    this.emailer.sendTextReceivedEmail(text);
    let id = uuid.v4();
    let createdText = Text.createFromTwilio(id, text)
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
      console.error(`addNewReceivedText(${this.shortDebugTwilioInboundText(text)})`, err);
      return Promise.reject(err);
    })
  }

  public addTextFromTwilioLog(text: TwilioRecord): Promise<Text> {
    let id = uuid.v4();
    let createdText = AppText.isAppText(text) ? AppText.fromTwilio(id, text) : InboundText.fromTwilio(id, text);
    let inDbForm = createdText.toDbForm();

    return this.dbFacade.createText(inDbForm)
    .then(addedToDb => this.populateText(inDbForm))
    .then(populatedText => {
      let text = Text.fromJSON(populatedText);
      return text;
    })
  }

  public addNewSentText(text: TwilioOutboundText, user: UserWithoutPassword): Promise<Text> {
    this.emailer.sendTextSentEmail(text);
    let id = uuid.v4();
    let createdText = OutboundText.fromTwilio(id, text);
    createdText.sentBy = new UserActionInfo(
      new Date(),
      user.username
    );
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

  private populateText(text: Text): Promise<Text> {
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
    let checkNumber = Text.isTextOutgoing(text) ? text.to : text.from;
    return this.getRacers()
      .then(racers => {
        let possibleRacers = racers.filter(racer => racer.hasPhoneNumber(checkNumber));
        copy.racer = possibleRacers.length ? possibleRacers[0].id : undefined;
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
      if (!text.racer) {
        return copy;
      }
      let possibleTeams = teams.filter(team => team.hasRacer(text.racer));
      copy.team = possibleTeams.length ? possibleTeams[0].id : undefined;
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
    return this.dbFacade.getAllTeamUpdates()
      .then(docs => {
        let updates = docs;
        return Promise.resolve(updates);
      });
  }

  getStatusUpdate(id: TeamUpdateId): Promise<TeamUpdate> {
    return this.dbFacade.getTeamUpdate({id})
    .then(update => {
      if (!update) {
        throw new NotFoundError(id, TeamUpdate)
      } else {
        return update;
      }
    })
    .then(update => TeamUpdate.fromJSON(update))
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
    .then(user => {
      if (!user) {
        throw new NotFoundError(username, User);
      } else {
        return user;
      }
    })
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
    properties.recentlyReset = true;
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

//================================================================
  
  mapPinStrings = {};

  getTeamMapPinSVG(teamId: TeamId): Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.mapPinStrings[teamId]) {
        // If in cache, return directly
        resolve(this.mapPinStrings[teamId])
      } else {
        // If not, then look up team and add to cache
        let teamPinTemplate = getTeamPinTemplate();
        this.getTeam(teamId)
        .then(team => {
          let teamNumberNode = teamPinTemplate.getElementById("PIN_TEXT")
          teamNumberNode.textContent = teamId;
          let color = team.color;
          if (color) {
            let pinBlobNode = teamPinTemplate.getElementById("PIN_BLOB");
            pinBlobNode.setAttribute("style", `fill:${color}`)
          }
          let svgString = XML_SERIALIZER.serializeToString(teamPinTemplate);
          resolve(svgString);
          this.mapPinStrings[teamId] = svgString;
        })
        .catch(err => reject(err))
      }
    });
  }

  invalidateMapPinForTeam(teamId: TeamId) {
    this.mapPinStrings[teamId] = undefined;
  }
}

