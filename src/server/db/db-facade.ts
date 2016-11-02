import { Racer, RacerId } from "../../common/racer";
import { Team, TeamId } from "../../common/team";
import { TeamUpdate, TeamUpdateId } from "../../common/update";
import { Text, DbFormText, PhoneNumber, TwilioInboundText, TwilioOutboundText } from "../../common/text";
import { UserWithoutPassword } from '../../common/user';
import { ThingEvent, ThingEventId } from "../../common/event";

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

  getTexts(query): Promise<DbFormText[]>;
  getText(query): Promise<DbFormText>;
  updateText(query): Promise<void>;
  createText(text: DbFormText): Promise<void>;
  deleteText(text: DbFormText): Promise<void>;

  createStatusUpdate(properties): Promise<TeamUpdate>;
  getStatusUpdates(): Promise<TeamUpdate[]>;
  getStatusUpdate(id: TeamUpdateId): Promise<TeamUpdate>;

  getUser(username): Promise<User>;
  canAddUser(username): Promise<boolean>;
  addUser(username, password, properties): Promise<User>;

  getEvents(): Promise<ThingEvent[]>;
  getEvent(id: ThingEventId): Promise<ThingEvent>;
  updateEvent(event: ThingEvent): Promise<ThingEvent>;
  createEvent(obj): Promise<ThingEvent>;
  deleteEvent(id: ThingEventId): Promise<void>;
}

