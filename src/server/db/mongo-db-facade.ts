import { Racer, RacerId } from "../../common/racer";
import { Team, TeamId, PopulatedTeam, UnpopulatedTeam } from "../../common/team";
import { TeamStatus, TeamUpdate, TeamUpdateId, Location } from "../../common/update";
import { Text, InboundText, OutboundText, PhoneNumber, TwilioInboundText, TwilioOutboundText, FullFormText, DbFormText } from "../../common/text";
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

  createFromInboundText(text: TwilioInboundText): Promise<Text> {
    let collection = this.db.collection('texts');
    let id = uuid.v4();
    let createdText = InboundText.fromTwilio(id, text);
    let fromNumber = createdText.from;
    return this.getRacers()
      .then(racers => {
        createdText.racer = racers.filter(
          racer => racer.phone == fromNumber)[0];
        return this.getTeams()
      })
      .then(teams => {
        createdText.team = teams
          .filter(team =>
            team.racers.filter(racer => racer.id == createdText.racer.id).length > 0)[0];
      })
      .then(result => {
        return collection.insert(createdText.toDbForm());
      })
      .then(result => {
        return Promise.resolve(createdText)
      });
  }

  createFromOutboundText(text: TwilioOutboundText): Promise<Text> {
    let collection = this.db.collection('texts');
    let id = uuid.v4();
    let createdText = OutboundText.fromTwilio(id, text);
    let toNumber = createdText.to;
    return this.getRacers()
      .then(racers => {
        createdText.racer = racers.filter(
          racer => racer.phone == toNumber)[0];
        return this.getTeams()
      })
      .then(teams => {
        createdText.team = teams
          .filter(team =>
            team.racers.filter(racer => racer.id == createdText.racer.id).length > 0)[0];
      })
      .then(result => {
        return collection.insert(createdText.toDbForm());
      })
      .then(result => {
        return Promise.resolve(createdText)
      });
  }

  private populateText(text: DbFormText): Promise<FullFormText> {
    let copy = JSON.parse(JSON.stringify(text));
    return this.getRacer(text.racer)
      .then(racer => {
        copy.racer = racer;
        return this.getTeam(text.team)
          .then(team => {
            copy.team = team;
            return Promise.resolve(copy);
          });
      });
  }

  getTexts(): Promise<Text[]>{
    let collection = this.db.collection('texts');
    return collection.find({}).toArray()
      .then(docs => {
        let textPromises = docs.map(text => this.populateText(text))
        return Promise.all(textPromises)
          .then(texts => texts.map(text => <FullFormText> Text.fromJSON(text)));
      });
  }

  getTextsByNumber(number: PhoneNumber): Promise<Text[]>{
    let collection = this.db.collection('texts');
    return collection.find({from: number}).toArray()
      .then(docs => {
        let textPromises = docs.map(text => this.populateText(text))
        return Promise.all(textPromises)
          .then(texts => texts.map(text => <FullFormText> Text.fromJSON(text)));
      });
  }

  updateText(text: Text): Promise<Text> {
    let collection = this.db.collection('texts');
    let textInDbForm = text.toDbForm();
    return collection.updateOne({id: text.id}, { $set: textInDbForm})
      .then(result => {
        return Promise.resolve(text);
      });
  }

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
}




//================================================================
//================================================================


//================================================================


//================================================================
