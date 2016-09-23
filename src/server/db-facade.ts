import { Racer } from "../common/racer";
import { Team } from "../common/team";

let racers = {
  "200": {id: 200, name: 'Tom Smith', nationality: 'GB', phone: '+12134732'},
  "201": {id: 201, name: 'Dick Stanley', nationality: 'GB', phone: '+1912912'},
  "202": {id: 202, name: 'Harry Monaghan', nationality: 'US', phone: '+121240342'},
  "203": {id: 203, name: 'Sally Garrard', nationality: 'CA', phone: '+12554654'},
  "204": {id: 204, name: 'Jess Swanwick', nationality: 'FR', phone: '+121239123'},
  "205": {id: 205, name: 'Veronica Thomson', nationality: 'DE', phone: '+1289238942'}
};
let nextRacerId = 206;

let teams = [
  {id: 21, name: 'H2G2', racers: [
    racers["200"], racers["202"], racers["204"] 
  ]},
  {id: 22, name: 'Prague or Bust', racers: [
    racers["201"], racers["203"], racers["205"]
  ]}
];
let nextTeamId = 23;

export function getRacers(): [Racer] {
  let racersArray : [Racer] = <[Racer]> [];
  for (var id in racers) {
    var racer = racers[id];
    racersArray.push(racer);
  }
  return racersArray;
}

export function getRacer(id: number): Racer {
  return racers[String(id)];
}

export function updateRacer(id: number, newRacer: Racer): Racer {
  racers[String(id)] = newRacer;
  return racers[String(id)];
}

export function createRacer(name: string): Racer {
  let newRacer = new Racer(nextRacerId, name);
  racers[String(newRacer.id)] = newRacer;
  nextRacerId++;
  return newRacer;
}

export function deleteRacer(id: number): void{
  delete racers[String(id)];
}

export function getTeams() : [Team] {
  return <[Team]> teams;
}
