import { Racer, RacerId } from "../../common/racer";
import { Team, TeamId, PopulatedTeam, UnpopulatedTeam } from "../../common/team";
import { TeamStatus, TeamUpdate, TeamUpdateId, Location } from "../../common/update";
import { DbFacadeInterface } from "./db-facade";
import { MongoClient } from "mongodb";
import { Promise } from "es6-promise";

import * as uuid from "node-uuid";

export function setup(url): Promise<MongoDbFacade> {

  return MongoClient.connect(url)
    .then(db => {
      console.log("connected to MongoDB server!");
      return Promise.resolve(new MongoDbFacade(db));
    });
}

class MongoDbFacade implements DbFacadeInterface {
  constructor(private db) {
    process.stdin.resume();//so the program will not close instantly
    function exitHandler(options, err) {
      if (this.db) {
        this.db.close();
        console.log("closed db");
      }
      if (options.cleanup) console.log('clean');
      if (err) console.log(err.stack);
      if (options.exit) process.exit();
    }
    //do something when app is closing
    process.on('exit', exitHandler.bind(this,{cleanup:true}));
    //catches ctrl+c event
    process.on('SIGINT', exitHandler.bind(this, {exit:true}));
    //catches uncaught exceptions
    process.on('uncaughtException', exitHandler.bind(this, {exit:true}));
  }

  getRacers(): Promise<[Racer]> {
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
        let racer = Racer.fromJSON(docs[0]);
        return Promise.resolve(racer);
    });
  }

  updateRacer(id: RacerId, newRacer: Racer): Promise<Racer> {
    let collection = this.db.collection('racers');
    return collection.updateOne({id: id}, { $set: newRacer})
      .then(result => {
        console.log('racer updated');
        return Promise.resolve(newRacer);
    });
  }

  createRacer(name: string): Promise<Racer> {
    let id = uuid.v4();
    let newRacer = new Racer(id, name);
    let collection = this.db.collection('racers');
    return collection.insert(newRacer)
      .then(result => {
      console.log('racer created');
      return Promise.resolve(newRacer);
    });
  }

  deleteRacer(id: RacerId): Promise<any> {
    let collection = this.db.collection('racers');
    return collection.deleteOne({id: id})
      .then(result => {
        console.log('racer created');
        return Promise.resolve();
      })
  }

//================================================================

  getTeams(): Promise<[Team]> {
    let collection = this.db.collection('teams');
    console.log('mongo-db-facade getTeams()');
    return collection.find({}).toArray()
      .then(docs => {
        console.log('got docs', docs);
        let teams = docs as [UnpopulatedTeam];
        let teamPromises = teams.map(team => this.populateTeam(team));
        console.log('teamPromises', teamPromises);
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
    console.log('mongo-db-facade populateTeam(', team);
    console.log('updatePromises', updatePromises);
    console.log('racerPromises', racerPromises);
    console.log('copy', copy);
    return Promise.all(updatePromises)
      .then((statuses: [TeamUpdate]) => {
        console.log('got populated statuses', statuses);
        copy.statusUpdates = statuses;
        return Promise.all(racerPromises)
          .then((racers: [Racer]) => {
            console.log('got populated racers', racers);
            copy.racers = racers;
            return Promise.resolve(copy);
          });
      });
  }

  getTeam(id: TeamId): Promise<Team> {
    let collection = this.db.collection('teams');
    return collection.find({id: id}).toArray()
      .then(docs => {
        let unpopulatedTeam = docs[0];
        return this.populateTeam(unpopulatedTeam)
          .then(team => Promise.resolve(Team.fromJSON(team)));
    });
  }

  updateTeam(id: TeamId, newTeam: Team) : Promise<Team> {
    let collection = this.db.collection('teams');
    let depopulatedTeam = newTeam.depopulate();
    return collection.updateOne({id: id}, { $set: depopulatedTeam})
      .then(result => {
        console.log('team updated');
        return Promise.resolve(newTeam);
    });
  }

  createTeam(name: string): Promise<Team> {
    let collection = this.db.collection('teams');
    let id = uuid.v4();
    let newTeam = new Team(id, name);
    return collection.insert(newTeam)
      .then(result => {
        console.log('team created');
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

  addText(text): Promise<any> {
    let collection = this.db.collection('texts');
    let id = uuid.v4();
    text.id = id;
    return collection.insert(text)
      .then(result => {
        return Promise.resolve(text);
      });
  }

  getTexts(): Promise<[any]>{
    let collection = this.db.collection('texts');
    return collection.find({}).toArray()
      .then(docs => {
        let texts = docs;
        return Promise.resolve(texts);
      });
  }

  getTextsByNumber(number): Promise<[any]>{
    let collection = this.db.collection('texts');
    return collection.find({}).toArray()
      .then(docs => {
        let texts = docs.filter(text => text.from === Number);
        return Promise.resolve(texts);
      });
  }

  createStatusUpdate(properties): Promise<TeamUpdate> {
    let collection = this.db.collection('updates');
    let id = uuid.v4();
    let newStatusUpdate = new TeamUpdate(id, properties);
    console.log('createStatusUpdate');
    console.log(newStatusUpdate);
    return collection.insert(newStatusUpdate)
      .then(result => {
        return Promise.resolve(newStatusUpdate);
      });
  }

  getStatusUpdates(): Promise<[TeamUpdate]> {
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
}




//================================================================
//================================================================


//================================================================


//================================================================
