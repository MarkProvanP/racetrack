import { Racer, RacerId } from "../../common/racer";
import { Team, UnpopulatedTeam, PopulatedTeam, TeamId } from "../../common/team";
import { TeamUpdate, TeamUpdateId, TeamStatus, Location } from "../../common/update";
import { DbFacadeInterface } from "./db-facade";
import { Promise } from "es6-promise";

export class InMemoryDbFacade implements DbFacadeInterface {
  constructor() {
    let racerProperties = [
      {name: 'Tom Smith', nationality: 'GB', phone: '+12134732'},
      {name: 'Dick Stanley', nationality: 'GB', phone: '+1912912'},
      {name: 'Harry Monaghan', nationality: 'US', phone: '+121240342'},
      {name: 'Sally Garrard', nationality: 'CA', phone: '+12554654'},
      {name: 'Jess Swanwick', nationality: 'FR', phone: '+121239123'},
      {name: 'Veronica Thomson', nationality: 'DE', phone: '+1289238942'}
    ];

    let teamProperties = [
      {name: 'H2G2', racers: []},
      {name: 'Prague or Bust', racers: []}
    ]

    let racerCreatePromises = racerProperties.map(racer => this.createRacer(racer));

    Promise.all(racerCreatePromises)
      .then(createdRacers => {
        createdRacers.forEach((r, i) => {
          let racerTeam = teamProperties[i % 2];
          racerTeam.racers.push(r);
        });
        let teamCreatePromises = teamProperties.map(team => this.createTeam(team));
        Promise.all(teamCreatePromises)
          .then(teams => {
            console.log('Created default teams');
            console.log(teams);
          });
      });
  }
  private racers = {};
  private nextRacerId = 200;
  private teams = {};
  private nextTeamId = 20;

  getRacers(): Promise<[Racer]> {
    let racersArray : [Racer] = <[Racer]> [];
    for (var id in this.racers) {
      let racerString = this.racers[id];
      let racer = Racer.fromJSON(JSON.parse(racerString));
      racersArray.push(racer);
    }
    return Promise.resolve(racersArray);
  }

  getRacer(id: RacerId): Promise<Racer> {
    let racerString = this.racers[String(id)];
    let racer = Racer.fromJSON(JSON.parse(racerString));
    return Promise.resolve(racer);
  }

  updateRacer(id: RacerId, newRacer: Racer): Promise<Racer> {
    this.racers[String(id)] = JSON.stringify(newRacer);
    return Promise.resolve(newRacer);
  }

  createRacer(properties): Promise<Racer> {
    let newRacer = new Racer(this.nextRacerId, properties);
    this.racers[String(newRacer.id)] = JSON.stringify(newRacer);
    this.nextRacerId++;
    return Promise.resolve(newRacer);
  }

  deleteRacer(id: RacerId): Promise<any> {
    delete this.racers[String(id)];
    return Promise.resolve();
  }


  getTeams() : Promise<[Team]> {
    let teams : [UnpopulatedTeam] = <[UnpopulatedTeam]> [];
    for (var id in this.teams) {
      let teamString = this.teams[id];
      let team = JSON.parse(teamString);
      teams.push(team);
    }
    let teamsPromises = teams.map(team => this.populateTeam(team));
    return Promise.all(teamsPromises)
      .then(teams => teams.map(team => Team.fromJSON(team)));
  }

  private populateTeam(team: UnpopulatedTeam): Promise<PopulatedTeam> {
    let updatePromises = team.statusUpdates
      .map(update => this.getStatusUpdate(update));
    let racerPromises = team.racers
      .map(racer => this.getRacer(racer));
    let copy = JSON.parse(JSON.stringify(team));
    return Promise.all(updatePromises)
      .then((statuses: [TeamUpdate]) => {
        copy.statusUpdates = statuses;
        return Promise.all(racerPromises)
          .then((racers: [Racer]) => {
            copy.racers = racers;
            return Promise.resolve(copy);
          });
      });
  }

  getTeam(id: TeamId): Promise<Team> {
    let teamString = this.teams[String(id)];
    let unpopulatedTeam = JSON.parse(teamString);
    return this.populateTeam(unpopulatedTeam)
      .then(team => Promise.resolve(Team.fromJSON(team)));
  }

  private writeTeam(id: TeamId, team: Team): Promise<Team> {
    let depopulatedTeam = team.depopulate();
    this.teams[String(id)] = JSON.stringify(depopulatedTeam);
    return Promise.resolve(team);
  }

  updateTeam(id: TeamId, newTeam: Team) : Promise<Team> {
    return this.writeTeam(id, newTeam);
  }

  createTeam(properties): Promise<Team> {
    let newTeam = new Team(this.nextTeamId++, properties);
    return this.writeTeam(newTeam.id, newTeam);
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
    let newStatusUpdate = new TeamUpdate(this.nextTeamUpdateId++, properties);
    this.teamUpdates[String(newStatusUpdate.id)] = newStatusUpdate;
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

