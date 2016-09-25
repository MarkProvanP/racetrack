import { Racer } from "../../common/racer";
import { Team, TeamId, TeamStatus, TeamUpdate, TeamUpdateId, Location } from "../../common/team";
import { DbFacadeInterface } from "./db-facade";
import { Promise } from "es6-promise";

export class InMemoryDbFacade implements DbFacadeInterface {
  private racers = {
    "200": {id: 200, name: 'Tom Smith', nationality: 'GB', phone: '+12134732'},
    "201": {id: 201, name: 'Dick Stanley', nationality: 'GB', phone: '+1912912'},
    "202": {id: 202, name: 'Harry Monaghan', nationality: 'US', phone: '+121240342'},
    "203": {id: 203, name: 'Sally Garrard', nationality: 'CA', phone: '+12554654'},
    "204": {id: 204, name: 'Jess Swanwick', nationality: 'FR', phone: '+121239123'},
    "205": {id: 205, name: 'Veronica Thomson', nationality: 'DE', phone: '+1289238942'}
  };
  private nextRacerId = 206;

  private teams = {
    "21": new Team(21, 'H2G2', [
      this.racers["200"], this.racers["202"], this.racers["204"] 
    ], []),
    "22": new Team(22, 'Prague or Bust', [
      this.racers["201"], this.racers["203"], this.racers["205"]
    ], [])
  };
  private nextTeamId = 23;

  getRacers(): Promise<[Racer]> {
    let racersArray : [Racer] = <[Racer]> [];
    for (var id in this.racers) {
      var racer = this.racers[id];
      racersArray.push(racer);
    }
    return Promise.resolve(racersArray);
  }

  getRacer(id: number): Promise<Racer> {
    return Promise.resolve(this.racers[String(id)]);
  }

  updateRacer(id: number, newRacer: Racer): Promise<Racer> {
    this.racers[String(id)] = newRacer;
    return Promise.resolve(this.racers[String(id)]);
  }

  createRacer(name: string): Promise<Racer> {
    let newRacer = new Racer(this.nextRacerId, name);
    this.racers[String(newRacer.id)] = newRacer;
    this.nextRacerId++;
    return Promise.resolve(newRacer);
  }

  deleteRacer(id: number): Promise<any> {
    delete this.racers[String(id)];
    return Promise.resolve();
  }


  getTeams() : Promise<[Team]> {
    console.log('db-facade getTeams()');
    let teams : [Team] = <[Team]> [];
    for (var id in this.teams) {
      let team = this.teams[id];
      teams.push(team);
    }
    let teamsPromises = teams.map(this.populateTeamUpdates);
    return Promise.all(teamsPromises);
  }

  private populateTeamUpdates(team: Team): Promise<Team> {
    let statusUpdateIds = team.statusUpdates.map(su => {
      if (su instanceof TeamUpdate) {
        return su.id;
      }
      return su;
    });
    let updatePromises = team.statusUpdates
      .map(update => this.getStatusUpdate(update));
    return Promise.all(updatePromises)
      .then((statuses) => {
        team.statusUpdates = statuses;
        return Promise.resolve(team);
      });
  }

  getTeam(id: TeamId): Promise<Team> {
    console.log('db-facade get team', id);
    let team = this.teams[String(id)];
    return this.populateTeamUpdates(team);
  }

  updateTeam(id: TeamId, newTeam: Team) : Promise<Team> {
    let statusUpdateIds = newTeam.statusUpdates.map(obj => obj.id);
    newTeam.statusUpdates = statusUpdateIds;
    this.teams[String(id)] = newTeam;
    return Promise.resolve(this.teams[String(id)]);
  }

  createTeam(name: string): Promise<Team> {
    let newTeam = new Team(this.nextTeamId, name);
    this.teams[String(newTeam.id)] = newTeam;
    this.nextTeamId++;
    return Promise.resolve(newTeam);
  }
  deleteTeam(id: TeamId): Promise<any> {
    delete this.teams[String(id)];
    return Promise.resolve();
  }
  private texts = {};

  addText(text): Promise<any> {
    this.texts[text.SmsSid] = text;
    return Promise.resolve();
  }

  getTexts(): Promise<any> {
    let textsArray = [];
    for (var smsSid in this.texts) {
      var text = this.texts[smsSid];
      textsArray.push(text);
    }
    return Promise.resolve(textsArray);
  }

  getTextsByNumber(number): Promise<any> {
    let textsArray = [];
    for (var smsSid in this.texts) {
      var text = this.texts[smsSid];
      if (text.From === number) {
        textsArray.push(text);
      }
    }
    return Promise.resolve(textsArray);
  }

  private teamUpdates = {};
  private nextTeamUpdateId = 0;

  createStatusUpdate(properties): Promise<TeamUpdate> {
    let newStatusUpdate = new TeamUpdate(
      this.nextTeamUpdateId, properties.status, properties.location, properties.notes);
    this.teamUpdates[String(newStatusUpdate.id)] = newStatusUpdate;
    this.nextTeamUpdateId++;
    return Promise.resolve(newStatusUpdate);
  }

  getStatusUpdates(): Promise<[TeamUpdate]> {
    let updatesArray: [TeamUpdate] = <[TeamUpdate]>[];
    for (var id in this.teamUpdates) {
      var update = this.teamUpdates[id];
      updatesArray.push(update);
    }
    return Promise.resolve(updatesArray);
  }

  getStatusUpdate(id: TeamUpdateId): Promise<TeamUpdate> {
    return Promise.resolve(this.teamUpdates[String(id)]);
  }
}



//================================================================



//================================================================


//================================================================

