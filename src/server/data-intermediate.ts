const APP_TEXT_HEADER = "!AutoUpdate!";

import { DbFacadeInterface} from "./db/db-facade";
import {
  Text,
  DbFormText,
  PhoneNumber,
  InboundText,
  OutboundText,
  AppText,
  TwilioInboundText,
  TwilioOutboundText,
  FullFormText,
} from "../common/text";
import { UserWithoutPassword } from "../common/user";
import {
  TextReceivedMessage,
  TextSentMessage,
  TextUpdatedMessage
} from "../common/message";
import { MessageSender } from "./server";

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

export class DataIntermediary {
  constructor(
    private dbFacade: DbFacadeInterface,
    private messageSender: MessageSender
  ) {}

  public getTexts(): Promise<Text[]> {
    return this.dbFacade.getTexts({})
    .then(texts => this.getTextsReady(texts));
  }

  public getTextsByNumber(phone: PhoneNumber): Promise<Text[]> {
    return this.dbFacade.getTexts({from: phone})
    .then(texts => this.getTextsReady(texts));
  }

  private populateText(text: DbFormText): Promise<FullFormText> {
    return this.addRacerToText(text)
      .then(textWithRacer => this.addTeamToText(textWithRacer))
  }

  private getTextsReady(texts: DbFormText[]): Promise<Text[]> {
    let textPromises = texts.map(text => this.populateText(text));
    return Promise.all(textPromises)
      .then(texts => texts.map(text => Text.fromJSON(text)));
  }

  public updateText(text: Text): Promise<Text> {
    let textInDbForm = text.toDbForm();
    return this.dbFacade.updateText(textInDbForm)
    .then(t => {
      let newMessage = new TextUpdatedMessage(text);
      console.log(newMessage);
      this.messageSender.sendMessageToWebClients(newMessage);
      return text;
    });
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
    return this.dbFacade.getRacers()
      .then(racers => {
        let matchingRacers = racers.filter(
          racer => racer.phones.filter(contact => contact.number == fromNumber).length);
        if (matchingRacers.length > 0) {
          createdText.racer = matchingRacers[0];
        } else {
        }
        return this.dbFacade.getTeams()
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
      });
  }

  public addNewSentText(text: TwilioOutboundText, user: UserWithoutPassword): Promise<Text> {
    let id = uuid.v4();
    let createdText = OutboundText.fromTwilio(id, text);
    createdText.sentBy = {
      user: user,
      timestamp: new Date()
    }
    let toNumber = createdText.to;
    return this.dbFacade.getRacers()
      .then(racers => {
        let matchingRacers = racers.filter(
          racer => racer.phones.filter(contact => contact.number == toNumber).length);
        if (matchingRacers.length > 0) {
          createdText.racer = matchingRacers[0];
        } else {
        }
        return this.dbFacade.getTeams()
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

  private addRacerToText(text): Promise<any> {
    let copy = JSON.parse(JSON.stringify(text));
    if (text.racer) {
      return this.dbFacade.getRacer(text.racer)
        .then(racer => {copy.racer = racer; return copy});
    } else {
      let inbound = text.text_subclass == "InboundText";
      if (inbound) {
      } else {
      }
      return this.dbFacade.getRacers()
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
    }
  }

  private addTeamToText(text): Promise<any> {
    let copy = JSON.parse(JSON.stringify(text));
    if (text.team) {
      return this.dbFacade.getTeam(text.team)
        .then(team => {
          copy.team = team;
          return Promise.resolve(copy);
        })
        .catch(err => {
          return err;
        });
    } else {
      return this.dbFacade.getTeams()
        .then(teams => {
          copy.team = teams.filter(team => team.racers.filter(racer => text.racer && racer.id == text.racer.id).length)[0];
          return Promise.resolve(copy);
        })
        .catch(err => {
          console.error('error', err);
          return err;
        });
    }
  }

}

