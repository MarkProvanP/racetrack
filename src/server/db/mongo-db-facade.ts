const APP_TEXT_HEADER = "!AutoUpdate!";

import { Racer, RacerId, DbFormRacer } from "../../common/racer";
import { Team, TeamId, PopulatedTeam, UnpopulatedTeam, DbFormTeam } from "../../common/team";
import {
  TeamStatus,
  TeamUpdate,
  TeamUpdateId,
  Location,
  DbFormTeamUpdate
} from "../../common/update";
import {
  Text,
  TextId,
  InboundText,
  OutboundText,
  AppText,
  PhoneNumber,
  TwilioInboundText,
  TwilioOutboundText,
  FullFormText,
  DbFormText
} from "../../common/text";
import { ThingEvent, ThingEventId } from "../../common/event";
import { DbFacadeInterface } from "./db-facade";
import { MongoClient } from "mongodb";
import { Promise } from "es6-promise";

import { User } from '../auth';

import * as uuid from "node-uuid";

import * as winston from "winston";

import { NoSuchUserError } from '../../common/error';
import { UserWithoutPassword } from '../../common/user';

export function setup(url): Promise<MongoDbFacade> {

  return MongoClient.connect(url)
    .then(db => {
      winston.info("Got connection to MongoDB server!");
      return Promise.resolve(new MongoDbFacade(db));
    });
}

class MongoDbFacade implements DbFacadeInterface {
  textsCollection;
  racersCollection;
  teamsCollection;
  updatesCollection;

  constructor(public db) {
    process.stdin.resume();//so the program will not close instantly
    function exitHandler(options, err) {
      if (this.db) {
        this.db.close();
        winston.info('MongoDB connection closed safely');
      }
      if (options.cleanup)
      if (err) winston.error(err.stack);
      if (options.exit) process.exit();
    }
    //do something when app is closing
    process.on('exit', exitHandler.bind(this,{cleanup:true}));
    //catches ctrl+c event
    process.on('SIGINT', exitHandler.bind(this, {exit:true}));
    //catches uncaught exceptions
    process.on('uncaughtException', exitHandler.bind(this, {exit:true}));

    this.racersCollection = this.db.collection('racers');
    this.textsCollection = this.db.collection('texts');
    this.teamsCollection = this.db.collection('teams');
    this.updatesCollection = this.db.collection('updates');
  }

  getRacers(query): Promise<DbFormRacer[]> {
    let r = this.racersCollection.find(query).toArray() as DbFormRacer[];
    return Promise.resolve(r);
  }

  getRacer(query): Promise<DbFormRacer> {
    return this.racersCollection.findOne(query)
    .catch(err => {
      console.error('mongoDbFacade getRacer() error', err)
      return Promise.reject(err);
    })
  }

  updateRacer(racer: DbFormRacer): Promise<void> {
    return this.racersCollection.updateOne({id: racer.id}, { $set: racer});
  }

  createRacer(racer: DbFormRacer): Promise<void> {
    return this.racersCollection.insert(racer);
  }

  deleteRacer(id: RacerId): Promise<void> {
    return this.racersCollection.deleteOne({id});
  }

//================================================================
  
  getTeams(query): Promise<DbFormTeam[]> {
    let t = this.teamsCollection.find(query).toArray() as DbFormTeam[];
    return Promise.resolve(t);
  }

  getTeam(query): Promise<DbFormTeam> {
    let t = this.teamsCollection.findOne(query) as DbFormTeam;
    return Promise.resolve(t);
  }

  updateTeam(team: DbFormTeam): Promise<void> {
    return this.teamsCollection.updateOne({id: team.id}, { $set: team });
  }

  createTeam(team: DbFormTeam): Promise<void> {
    return this.teamsCollection.insert(team);
  }

  deleteTeam(id: TeamId): Promise<void> {
    return this.teamsCollection.deleteOne({id});
  }


//================================================================
  getTexts(query): Promise<DbFormText[]> {
    let t = this.textsCollection.find(query).toArray() as DbFormText[]
    return Promise.resolve(t);
  }

  getText(query): Promise<DbFormText> {
    let t = this.textsCollection.findOne(query) as DbFormText
    return Promise.resolve(t);
  }
  updateText(text: DbFormText): Promise<void> {
    return this.textsCollection.updateOne({id: text.id}, { $set: text})
  }
  createText(text: DbFormText): Promise<void> {
    return this.textsCollection.insert(text);
  }
  deleteText(id: TextId): Promise<void> {
    return this.textsCollection.deleteOne({id});
  }

//================================================================
  getTeamUpdates(query): Promise<DbFormTeamUpdate[]> {
    return this.updatesCollection.find(query).toArray();
  }

  getTeamUpdate(query): Promise<DbFormTeamUpdate> {
    return this.updatesCollection.findOne(query);
  }

  updateTeamUpdate(update: DbFormTeamUpdate): Promise<void> {
    return this.updatesCollection.updateOne({id: update.id}, {$set: update})
  }

  createTeamUpdate(update: DbFormTeamUpdate): Promise<void> {
    return this.updatesCollection.insert(update);
  }

  deleteTeamUpdate(id: TeamUpdateId): Promise<void> {
    return this.updatesCollection.deleteOne({id});
  }


//================================================================

  getUser(username): Promise<User> {
    let collection = this.db.collection('users');
    return collection.find({username: username}).toArray()
      .then(docs => {
        if (docs.length == 0) {
          throw new NoSuchUserError(username);
        }
        let user = User.fromJSON(docs[0]);
        return Promise.resolve(user);
      });
  }

  canAddUser(username): Promise<boolean> {
    let collection = this.db.collection('users');
    return collection.find({username: username}).toArray()
      .then(docs => {
        if (docs.length == 0) {
          return Promise.resolve(true)
        } else {
          return Promise.resolve(false)
        }
      });
  }

  addUser(username, password, properties): Promise<User> {
    let collection = this.db.collection('users');
    let user = User.createWithPassword(username, password, properties);
    return collection.insert(user)
      .then(result => {
        return Promise.resolve(user);
      });
  }

//================================================================

  getEvents(): Promise<ThingEvent[]> {
    let collection = this.db.collection('events');
    return collection.find({}).toArray()
      .then(docs => docs.map(event => ThingEvent.fromJSON(event)))
  }

  getEvent(id: ThingEventId): Promise<ThingEvent> {
    let collection = this.db.collection('events');
    return collection.find({id}).toArray()
    .then(docs => {
      if (docs.length > 0) {
        return Promise.resolve(ThingEvent.fromJSON(docs[0]))
      } else {
        return Promise.reject(`No event with id ${id}`);
      }
    })
  }

  updateEvent(event: ThingEvent): Promise<ThingEvent> {
    let collection = this.db.collection('events');
    let id = event.id;
    return collection.updateOne({id}, {$set: event})
      .then(result => event);
  }

  createEvent(obj): Promise<ThingEvent> {
    let collection = this.db.collection('events');
    let id = uuid.v4();
    let newEvent = ThingEvent.create(id, obj);
    return collection.insert(newEvent)
      .then(result => newEvent);
  }

  deleteEvent(id: ThingEventId): Promise<void> {
    let collection = this.db.collection('events');
    return collection.deleteOne({id: id})
  }
}
