import { Racer, RacerId } from "../../common/racer";
import { Team, TeamId, PopulatedTeam, UnpopulatedTeam, DbFormTeam } from "../../common/team";
import {
  TeamStatus,
  TeamUpdate,
  TeamUpdateId,
  Location
} from "../../common/update";
import {
  Text,
  TextId,
  InboundText,
  OutboundText,
  AppText,
  PhoneNumber,
  TwilioInboundText,
  TwilioOutboundText
} from "../../common/text";
import { ThingEvent, ThingEventId } from "../../common/event";
import { DbFacadeInterface } from "./db-facade";
import { MongoClient } from "mongodb";

import { User } from '../auth';
import { SavedConfig } from "../data-intermediate";

import * as uuid from "uuid";

import * as winston from "winston";

import { UserWithoutPassword, UserId } from '../../common/user';

export function setup(url): Promise<MongoDbFacade> {

  return MongoClient.connect(url)
    .then(db => {
      winston.info("Got connection to MongoDB server!");
      return Promise.resolve(new MongoDbFacade(db));
    });
}

class MongoDbFacade implements DbFacadeInterface {
  configCollection;
  textsCollection;
  racersCollection;
  teamsCollection;
  updatesCollection;
  usersCollection;

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

    this.configCollection = this.db.collection('config');
    this.racersCollection = this.db.collection('racers');
    this.textsCollection = this.db.collection('texts');
    this.teamsCollection = this.db.collection('teams');
    this.updatesCollection = this.db.collection('updates');
    this.usersCollection = this.db.collection('users');
  }

//================================================================

  getSavedConfig(): Promise<SavedConfig> {
    return this.configCollection.findOne({})
  }

  createSavedConfig(savedConfig: SavedConfig): Promise<void> {
    return this.configCollection.insert(savedConfig);
  }

  updateSavedConfig(savedConfig: SavedConfig): Promise<void> {
    return this.configCollection.updateOne({}, { $set: savedConfig })
  }

//================================================================

  getAllRacers(): Promise<Racer[]> {
    return this.racersCollection.find({}).toArray();
  }

  getRacers(ids: RacerId[]) {
    let query = {
      id: { $in: ids }
    }
    return this.racersCollection.find(query)
    .toArray()
    .then(racers => {
      let obj = {}
      racers.forEach(racer => {
        obj[racer.id] = racer;
      })
      return obj;
    })
  }

  getRacer(query): Promise<Racer> {
    return this.racersCollection.findOne(query)
    .catch(err => {
      console.error('mongoDbFacade getRacer() error', err)
      return Promise.reject(err);
    })
  }

  updateRacer(racer: Racer): Promise<void> {
    return this.racersCollection.updateOne({id: racer.id}, { $set: racer});
  }

  createRacer(racer: Racer): Promise<void> {
    return this.racersCollection.insert(racer);
  }

  deleteRacer(id: RacerId): Promise<void> {
    return this.racersCollection.deleteOne({id});
  }

//================================================================
  
  getAllTeams(): Promise<DbFormTeam[]> {
    return this.teamsCollection.find({}).toArray();
  }

  getTeams(ids: TeamId[]) {
    let query = {
      id: { $in: ids }
    }
    return this.teamsCollection.find(query)
    .toArray()
    .then(teams => {
      let obj = {}
      teams.forEach(team => {
        obj[team.id] = team;
      })
      return obj;
    })
  }

  getTeam(query): Promise<DbFormTeam> {
    return this.teamsCollection.findOne(query);
  }

  updateTeam(team: DbFormTeam): Promise<DbFormTeam> {
    return this.teamsCollection.findOneAndReplace({id: team.id}, team, { returnNewDocument: true })
    .then(res => res.value)
  }

  createTeam(team: DbFormTeam): Promise<void> {
    return this.teamsCollection.insert(team);
  }

  deleteTeam(id: TeamId): Promise<void> {
    return this.teamsCollection.deleteOne({id});
  }


//================================================================
  getTexts(query): Promise<Text[]> {
    return this.textsCollection.find(query).toArray()
  }

  getText(query): Promise<Text> {
    return this.textsCollection.findOne(query)
  }
  updateText(text: Text): Promise<void> {
    return this.textsCollection.updateOne({id: text.id}, { $set: text})
  }
  createText(text: Text): Promise<void> {
    return this.textsCollection.insert(text);
  }
  deleteText(id: TextId): Promise<void> {
    return this.textsCollection.deleteOne({id});
  }

//================================================================
  getAllTeamUpdates(): Promise<TeamUpdate[]> {
    return this.updatesCollection.find({}).toArray();
  }

  getTeamUpdates(ids: TeamUpdateId[]) {
    let query = {
      id: { $in: ids }
    }
    return this.updatesCollection.find(query)
    .toArray()
    .then(updates => {
      let obj = {};
      updates.forEach(update => {
        obj[update.id] = update;
      })
      return obj;
    })
  }

  getTeamUpdate(query): Promise<TeamUpdate> {
    return this.updatesCollection.findOne(query);
  }

  updateTeamUpdate(update: TeamUpdate): Promise<void> {
    return this.updatesCollection.updateOne({id: update.id}, {$set: update})
  }

  createTeamUpdate(update: TeamUpdate): Promise<void> {
    return this.updatesCollection.insert(update);
  }

  deleteTeamUpdate(id: TeamUpdateId): Promise<void> {
    return this.updatesCollection.deleteOne({id});
  }


//================================================================

  getUser(query): Promise<User> {
    return this.usersCollection.findOne(query);
  }

  getUsers(query): Promise<User[]> {
    return this.usersCollection.find(query).toArray();
  }

  updateUser(user: User): Promise<void> {
    return this.usersCollection.updateOne({username: user.username}, {$set: user});
  }

  createUser(user: User): Promise<void> {
    return this.usersCollection.insert(user); 
  }

  deleteUser(id: UserId): Promise<void> {
    return this.usersCollection.deleteOne({username: id});
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
