import { Racer, RacerId } from "../../common/racer";
import { Team, UnpopulatedTeam, PopulatedTeam, TeamId } from "../../common/team";
import { TeamUpdate, TeamUpdateId, TeamStatus, Location } from "../../common/update";
import { Text, InboundText, OutboundText, PhoneNumber, TwilioInboundText, TwilioOutboundText, FullFormText, DbFormText } from "../../common/text";
import { DbFacadeInterface } from "./db-facade";
import { Promise } from "es6-promise";
import * as uuid from "node-uuid";
import { User } from '../auth';

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
  private teams = {};
  private teamUpdates = {};
  private texts = {};
  private users = {};

  getRacers(): Promise<Racer[]> {
    let racersArray : Racer[] = <Racer[]> [];
    for (var id in this.racers) {
      let racerString = this.racers[id];
      let racer = Racer.fromJSON(JSON.parse(racerString));
      racersArray.push(racer);
    }
    return Promise.resolve(racersArray);
  }

  getRacer(id: RacerId): Promise<Racer> {
    let racerString = this.racers[String(id)];
    if (racerString) {
      let racer = Racer.fromJSON(JSON.parse(racerString));
      return Promise.resolve(racer);
    } else {
      return Promise.reject(`Racer Id ${id} not found`);
    }
  }

  updateRacer(id: RacerId, newRacer: Racer): Promise<Racer> {
    this.racers[String(id)] = JSON.stringify(newRacer);
    return Promise.resolve(newRacer);
  }

  createRacer(properties): Promise<Racer> {
    let id = uuid.v4();
    let newRacer = new Racer(id, properties);
    this.racers[String(newRacer.id)] = JSON.stringify(newRacer);
    return Promise.resolve(newRacer);
  }

  deleteRacer(id: RacerId): Promise<any> {
    delete this.racers[String(id)];
    return Promise.resolve();
  }

//================================================================

  getTeams() : Promise<Team[]> {
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
    let id = uuid.v4();
    let newTeam = new Team(id, properties);
    return this.writeTeam(newTeam.id, newTeam);
  }

  deleteTeam(id: TeamId): Promise<any> {
    delete this.teams[String(id)];
    return Promise.resolve();
  }

//================================================================

  createFromInboundText(text: TwilioInboundText): Promise<Text> {
    let id = uuid.v4();
    let createdText = InboundText.fromTwilio(id, text);
    return this.writeText(createdText);
  }

  createFromOutboundText(text: TwilioOutboundText): Promise<Text> {
    let id = uuid.v4();
    let createdText = OutboundText.fromTwilio(id, text);
    return this.writeText(createdText);
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

  getTexts(): Promise<Text[]> {
    let textsArray = [];
    for (var id in this.texts) {
      let textString = this.texts[id];
      let parsed = JSON.parse(textString);
      textsArray.push(parsed);
    }
    let textsPromises = textsArray.map(this.populateText)
    return Promise.all(textsPromises)
      .then(texts => texts.map(text => Text.fromJSON(text)));
  }

  getTextsByNumber(number: PhoneNumber): Promise<Text[]> {
    return this.getTexts()
      .then(texts => texts
        .filter(text => text.from === number));
  }

  private writeText(text: Text): Promise<Text> {
    let textInDbForm = text.toDbForm();
    this.texts[String(text.id)] = JSON.stringify(textInDbForm);
    return Promise.resolve(text);
  }

  updateText(text: Text): Promise<Text> {
    return this.writeText(text);
  }

//================================================================

  createStatusUpdate(properties): Promise<TeamUpdate> {
    let id = uuid.v4();
    let newStatusUpdate = new TeamUpdate(id, properties);
    this.teamUpdates[String(newStatusUpdate.id)] = newStatusUpdate.toIdJSON();
    return Promise.resolve(newStatusUpdate);
  }

  getStatusUpdates(): Promise<TeamUpdate[]> {
    let updatesArray: TeamUpdate[] = [];
    for (var id in this.teamUpdates) {
      let updateString = this.teamUpdates[String(id)];
      let update = TeamUpdate.fromJSON(JSON.parse(updateString));
      updatesArray.push(update);
    }
    return Promise.resolve(updatesArray);
  }

  getStatusUpdate(id: TeamUpdateId): Promise<TeamUpdate> {
    let updateString = this.teamUpdates[String(id)];
    let update = TeamUpdate.fromJSON(JSON.parse(updateString));
    return Promise.resolve(update);
  }

//================================================================

  getUser(username): Promise<User> {
    let userString = this.users[String(username)];
    let user = User.fromJSON(JSON.parse(userString));
    return Promise.resolve(user);
  }

  canAddUser(username): Promise<boolean> {
    let canCreateUser = !this.users[String(username)];
    return Promise.resolve(canCreateUser);
  }

  addUser(username, password, properties) {
    let user = User.createWithPassword(username, password, properties);
    this.users[String(username)] = JSON.stringify(user);
    return Promise.resolve(user);
  }
}

