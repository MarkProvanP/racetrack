import { Racer, DbFormRacer, RacerId } from "../../common/racer";
import { Team, DbFormTeam, TeamId } from "../../common/team";
import { TeamUpdate, DbFormTeamUpdate, TeamUpdateId } from "../../common/update";
import {
  Text,
  TextId,
  DbFormText,
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

  getRacers(query): Promise<DbFormRacer[]>;
  getRacer(query): Promise<DbFormRacer>;
  updateRacer(racer: DbFormRacer): Promise<void>;
  createRacer(racer: DbFormRacer): Promise<void>;
  deleteRacer(id: RacerId): Promise<void>;

  getTeams(query) : Promise<DbFormTeam[]>;
  getTeam(query): Promise<DbFormTeam>;
  updateTeam(team: DbFormTeam) : Promise<void>;
  createTeam(team: DbFormTeam): Promise<void>;
  deleteTeam(id: TeamId): Promise<void>;

  getTexts(query): Promise<DbFormText[]>;
  getText(query): Promise<DbFormText>;
  updateText(query): Promise<void>;
  createText(text: DbFormText): Promise<void>;
  deleteText(id: TextId): Promise<void>;

  getTeamUpdates(query): Promise<DbFormTeamUpdate[]>;
  getTeamUpdate(query): Promise<DbFormTeamUpdate>;
  updateTeamUpdate(update: DbFormTeamUpdate): Promise<void>;
  createTeamUpdate(update: DbFormTeamUpdate): Promise<void>;
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

