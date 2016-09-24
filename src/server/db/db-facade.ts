import { Racer } from "../../common/racer";
import { Team, TeamId, TeamUpdate, TeamUpdateId } from "../../common/team";

var Promise = require("es6-promise").Promise;

export interface DbFacadeInterface {
  getRacers(): Promise<[Racer]>;
  getRacer(id: number): Promise<Racer>;
  updateRacer(id: number, newRacer: Racer): Promise<Racer>;
  createRacer(name: string): Promise<Racer>;
  deleteRacer(id: number): Promise<any>;

  getTeams() : Promise<[Team]>;
  getTeam(id: TeamId): Promise<Team>;
  updateTeam(id: TeamId, newTeam: Team) : Promise<Team>;
  createTeam(name: string): Promise<Team>;
  deleteTeam(id: TeamId): Promise<any>;

  addText(text): Promise<any>;
  getTexts(): Promise<any>;
  getTextsByNumber(number): Promise<any>;

  createStatusUpdate(properties): Promise<TeamUpdate>;
  getStatusUpdates(): Promise<[TeamUpdate]>;
  getStatusUpdate(id: TeamUpdateId): Promise<TeamUpdate>;
}

