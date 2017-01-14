import { Racer, RacerId } from "../../common/racer";
import { Team, DbFormTeam, TeamId } from "../../common/team";
import { TeamUpdate, TeamUpdateId } from "../../common/update";
import {
  Text,
  TextId,
  PhoneNumber,
  TwilioInboundText,
  TwilioOutboundText
} from "../../common/text";
import { UserWithoutPassword, UserId } from '../../common/user';
import { ThingEvent, ThingEventId } from "../../common/event";
import { SavedConfig } from "../data-intermediate";

import { User } from '../auth';

var Promise = require("es6-promise").Promise;

export interface DbFacadeInterface {
  getSavedConfig(): Promise<SavedConfig>;
  createSavedConfig(savedConfig: SavedConfig): Promise<void>;
  updateSavedConfig(savedConfig: SavedConfig): Promise<void>;

  getAllRacers(): Promise<Racer[]>;
  getRacers(ids: RacerId[]);
  getRacer(query): Promise<Racer>;
  updateRacer(racer: Racer): Promise<void>;
  createRacer(racer: Racer): Promise<void>;
  deleteRacer(id: RacerId): Promise<void>;

  getAllTeams() : Promise<DbFormTeam[]>;
  getTeams(ids: TeamId[]);
  getTeam(query): Promise<DbFormTeam>;
  updateTeam(team: DbFormTeam) : Promise<DbFormTeam>;
  createTeam(team: DbFormTeam): Promise<void>;
  deleteTeam(id: TeamId): Promise<void>;

  getTexts(query): Promise<Text[]>;
  getText(query): Promise<Text>;
  updateText(query): Promise<void>;
  createText(text: Text): Promise<void>;
  deleteText(id: TextId): Promise<void>;

  getAllTeamUpdates(): Promise<TeamUpdate[]>;
  getTeamUpdates(ids: TeamUpdateId[]);
  getTeamUpdate(query): Promise<TeamUpdate>;
  updateTeamUpdate(update: TeamUpdate): Promise<void>;
  createTeamUpdate(update: TeamUpdate): Promise<void>;
  deleteTeamUpdate(id: TeamUpdateId): Promise<void>;

  getUser(query): Promise<User>;
  getUsers(query): Promise<User[]>;
  updateUser(user): Promise<void>
  createUser(user): Promise<void>;
  deleteUser(username: UserId): Promise<void>;

  getEvents(): Promise<ThingEvent[]>;
  getEvent(id: ThingEventId): Promise<ThingEvent>;
  updateEvent(event: ThingEvent): Promise<ThingEvent>;
  createEvent(obj): Promise<ThingEvent>;
  deleteEvent(id: ThingEventId): Promise<void>;
}

