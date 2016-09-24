import { Racer } from "../common/racer";
import { Team, TeamId, TeamStatus, TeamUpdate, TeamUpdateId, Location } from "../common/team";

var Promise = require("es6-promise").Promise;

let racers = {
  "200": {id: 200, name: 'Tom Smith', nationality: 'GB', phone: '+12134732'},
  "201": {id: 201, name: 'Dick Stanley', nationality: 'GB', phone: '+1912912'},
  "202": {id: 202, name: 'Harry Monaghan', nationality: 'US', phone: '+121240342'},
  "203": {id: 203, name: 'Sally Garrard', nationality: 'CA', phone: '+12554654'},
  "204": {id: 204, name: 'Jess Swanwick', nationality: 'FR', phone: '+121239123'},
  "205": {id: 205, name: 'Veronica Thomson', nationality: 'DE', phone: '+1289238942'}
};
let nextRacerId = 206;

let teams = {
  "21": new Team(21, 'H2G2', [
    racers["200"], racers["202"], racers["204"] 
  ], []),
  "22": new Team(22, 'Prague or Bust', [
    racers["201"], racers["203"], racers["205"]
  ], [])
};
let nextTeamId = 23;

export function getRacers(): Promise<[Racer]> {
  let racersArray : [Racer] = <[Racer]> [];
  for (var id in racers) {
    var racer = racers[id];
    racersArray.push(racer);
  }
  return Promise.resolve(racersArray);
}

export function getRacer(id: number): Promise<Racer> {
  return Promise.resolve(racers[String(id)]);
}

export function updateRacer(id: number, newRacer: Racer): Promise<Racer> {
  racers[String(id)] = newRacer;
  return Promise.resolve(racers[String(id)]);
}

export function createRacer(name: string): Promise<Racer> {
  let newRacer = new Racer(nextRacerId, name);
  racers[String(newRacer.id)] = newRacer;
  nextRacerId++;
  return Promise.resolve(newRacer);
}

export function deleteRacer(id: number): Promise<any> {
  delete racers[String(id)];
  return Promise.resolve();
}

//================================================================

export function getTeams() : [Team] {
  console.log('db-facade getTeams()');
  let teamsArray : [Team] = <[Team]> [];
  for (var id in teams) {
    let team = teams[id];
    let populated = populateTeamUpdates(team);
    teamsArray.push(populated);
    console.log('populated', populated)
  }
  console.log('db-facade returning populated', teamsArray);
  return teamsArray;
}

function populateTeamUpdates(team: Team) : Team{
  let statusUpdateIds = team.statusUpdates.map(su => {
    if (su instanceof TeamUpdate) {
      return su.id;
    }
    return su;
  });
  if (statusUpdateIds) {
    let populatedStatusUpdates = statusUpdateIds.map(getStatusUpdate);
    team.statusUpdates = populatedStatusUpdates;
  }
  return team;
}

export function getTeam(id: TeamId): Team {
  console.log('db-facade get team', id);
  let team = teams[String(id)];
  let populatedTeam = populateTeamUpdates(team);
  console.log('unpop', team);
  console.log('pop', populatedTeam);
  return populatedTeam;
}

export function updateTeam(id: TeamId, newTeam: Team) : Team {
  let statusUpdateIds = newTeam.statusUpdates.map(obj => obj.id);
  newTeam.statusUpdates = statusUpdateIds;
  teams[String(id)] = newTeam;
  return teams[String(id)];
}

export function createTeam(name: string): Team {
  let newTeam = new Team(nextTeamId, name);
  teams[String(newTeam.id)] = newTeam;
  nextTeamId++;
  return newTeam;
}

export function deleteTeam(id: TeamId): void {
  delete teams[String(id)];
}

//================================================================

let texts = {};

export function addText(text) {
  texts[text.SmsSid] = text;
}

export function getTexts() {
  let textsArray = [];
  for (var smsSid in texts) {
    var text = texts[smsSid];
    textsArray.push(text);
  }
  return textsArray;
}

export function getTextsByNumber(number) {
  let textsArray = [];
  for (var smsSid in texts) {
    var text = texts[smsSid];
    if (text.From === number) {
      textsArray.push(text);
    }
  }
  return textsArray;
}

//================================================================

let teamUpdates = {};
let nextTeamUpdateId = 0;

export function createStatusUpdate(properties): TeamUpdate {
  let newStatusUpdate = new TeamUpdate(
    nextTeamUpdateId, properties.status, properties.location, properties.notes);
  teamUpdates[String(newStatusUpdate.id)] = newStatusUpdate;
  nextTeamUpdateId++;
  return newStatusUpdate;
}

export function getStatusUpdates(): [TeamUpdate] {
  let updatesArray: [TeamUpdate] = <[TeamUpdate]>[];
  for (var id in teamUpdates) {
    var update = teamUpdates[id];
    updatesArray.push(update);
  }
  return updatesArray;
}

export function getStatusUpdate(id: TeamUpdateId): TeamUpdate {
  return teamUpdates[String(id)];
}
