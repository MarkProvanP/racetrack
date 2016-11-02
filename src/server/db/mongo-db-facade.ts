const APP_TEXT_HEADER = "!AutoUpdate!";

import { Racer, RacerId } from "../../common/racer";
import { Team, TeamId, PopulatedTeam, UnpopulatedTeam } from "../../common/team";
import { TeamStatus, TeamUpdate, TeamUpdateId, Location } from "../../common/update";
import { Text, InboundText, OutboundText, AppText, PhoneNumber, TwilioInboundText, TwilioOutboundText, FullFormText, DbFormText } from "../../common/text";
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

    this.textsCollection = this.db.collection('texts');
  }

  getRacers(): Promise<Racer[]> {
    let collection = this.db.collection('racers');
    return collection.find({}).toArray()
      .then(docs => {
        let racers = docs.map(racer => Racer.fromJSON(racer));
        return Promise.resolve(racers);
    });
  }

  getRacer(id: RacerId): Promise<Racer> {
    let collection = this.db.collection('racers');
    return collection.find({id: id}).toArray()
      .then(docs => {
        if (docs.length > 0) {
          let racer = Racer.fromJSON(docs[0]);
          return Promise.resolve(racer);
        } else {
          return Promise.resolve(undefined);
        }
    });
  }

  updateRacer(id: RacerId, newRacer: Racer): Promise<Racer> {
    let collection = this.db.collection('racers');
    return collection.updateOne({id: id}, { $set: newRacer})
      .then(result => {
        return Promise.resolve(newRacer);
    });
  }

  createRacer(name: string): Promise<Racer> {
    let id = uuid.v4();
    let newRacer = new Racer(id, name);
    let collection = this.db.collection('racers');
    return collection.insert(newRacer)
      .then(result => {
      return Promise.resolve(newRacer);
    });
  }

  deleteRacer(id: RacerId): Promise<any> {
    let collection = this.db.collection('racers');
    return collection.deleteOne({id: id})
      .then(result => {
        return Promise.resolve();
      })
  }

//================================================================

  getTeams(): Promise<Team[]> {
    let collection = this.db.collection('teams');
    return collection.find({}).toArray()
      .then(docs => {
        let teams = docs as [UnpopulatedTeam];
        let teamPromises = teams.map(team => this.populateTeam(team));
        return Promise.all(teamPromises)
          .then(teams => teams.map(team => Team.fromJSON(team)));
      });
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
    let collection = this.db.collection('teams');
    return collection.find({id: id}).toArray()
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

  updateTeam(id: TeamId, newTeam: Team) : Promise<Team> {
    let collection = this.db.collection('teams');
    let depopulatedTeam = newTeam.depopulate();
    return collection.updateOne({id: id}, { $set: depopulatedTeam})
      .then(result => {
        return Promise.resolve(newTeam);
    });
  }

  createTeam(name: string): Promise<Team> {
    let collection = this.db.collection('teams');
    let id = uuid.v4();
    let newTeam = new Team(id, name);
    return collection.insert(newTeam)
      .then(result => {
        return Promise.resolve(newTeam);
      });
  }

  deleteTeam(id: TeamId): Promise<any> {
    let collection = this.db.collection('teams');
    return collection.deleteOne({id: id})
      .then(result => {
        return Promise.resolve();
      });
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
  deleteText(text: DbFormText): Promise<void> {
    return this.textsCollection.deleteOne({id: text.id})
  }

//================================================================

  createStatusUpdate(properties): Promise<TeamUpdate> {
    let collection = this.db.collection('updates');
    let id = uuid.v4();
    let newStatusUpdate = new TeamUpdate(id, properties);
    return collection.insert(newStatusUpdate)
      .then(result => {
        return Promise.resolve(newStatusUpdate);
      });
  }

  getStatusUpdates(): Promise<TeamUpdate[]> {
    let collection = this.db.collection('updates');
    return collection.find({}).toArray()
      .then(docs => {
        let updates = docs;
        return Promise.resolve(updates);
      });
  }

  getStatusUpdate(id: TeamUpdateId): Promise<TeamUpdate> {
    let collection = this.db.collection('updates');
    return collection.find({id: id}).toArray()
      .then(docs => {
        let update = docs[0];
        return Promise.resolve(update);
      });
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
