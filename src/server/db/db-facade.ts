import { Racer, RacerId } from "../../common/racer";
import { Team, TeamId } from "../../common/team";
import { TeamUpdate, TeamUpdateId } from "../../common/update";

var Promise = require("es6-promise").Promise;

export interface DbFacadeInterface {
  getRacers(): Promise<[Racer]>;
  getRacer(id: RacerId): Promise<Racer>;
  updateRacer(id: RacerId, newRacer: Racer): Promise<Racer>;
  createRacer(properties): Promise<Racer>;
  deleteRacer(id: RacerId): Promise<any>;

  getTeams() : Promise<[Team]>;
  getTeam(id: TeamId): Promise<Team>;
  updateTeam(id: TeamId, newTeam: Team) : Promise<Team>;
  createTeam(properties): Promise<Team>;
  deleteTeam(id: TeamId): Promise<any>;

  addText(text): Promise<any>;
  getTexts(): Promise<any>;
  getTextsByNumber(number): Promise<any>;

  createStatusUpdate(properties): Promise<TeamUpdate>;
  getStatusUpdates(): Promise<[TeamUpdate]>;
  getStatusUpdate(id: TeamUpdateId): Promise<TeamUpdate>;
}
