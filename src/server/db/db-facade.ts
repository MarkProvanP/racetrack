import { Racer, RacerId } from "../../common/racer";
import { Team, TeamId } from "../../common/team";
import { TeamUpdate, TeamUpdateId } from "../../common/update";
import { Text, PhoneNumber, TwilioInboundText, TwilioOutboundText } from "../../common/text";
import { UserWithoutPassword } from '../auth';

import { User } from '../auth';

var Promise = require("es6-promise").Promise;

export interface DbFacadeInterface {
  getRacers(): Promise<Racer[]>;
  getRacer(id: RacerId): Promise<Racer>;
  updateRacer(id: RacerId, newRacer: Racer): Promise<Racer>;
  createRacer(properties): Promise<Racer>;
  deleteRacer(id: RacerId): Promise<any>;

  getTeams() : Promise<Team[]>;
  getTeam(id: TeamId): Promise<Team>;
  updateTeam(id: TeamId, newTeam: Team) : Promise<Team>;
  createTeam(properties): Promise<Team>;
  deleteTeam(id: TeamId): Promise<any>;

  createFromInboundText(text: TwilioInboundText): Promise<Text>;
  createFromOutboundText(text: TwilioOutboundText, user: UserWithoutPassword): Promise<Text>;
  getTexts(): Promise<Text[]>;
  getTextsByNumber(phone: PhoneNumber): Promise<Text[]>;
  updateText(text: Text): Promise<Text>;

  createStatusUpdate(properties): Promise<TeamUpdate>;
  getStatusUpdates(): Promise<TeamUpdate[]>;
  getStatusUpdate(id: TeamUpdateId): Promise<TeamUpdate>;

  getUser(username): Promise<User>;
  canAddUser(username): Promise<boolean>;
  addUser(username, password, properties): Promise<User>;
}

