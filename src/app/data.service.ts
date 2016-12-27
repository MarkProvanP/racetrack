import { Injectable }    from '@angular/core';
import { Headers, Http } from '@angular/http';
import * as _ from "lodash";
import 'rxjs/add/operator/toPromise';

import { Team, TeamId } from '../common/team';
import { Racer, RacerId } from '../common/racer';
import { TeamUpdate } from '../common/update';
import { PhoneNumber } from '../common/text';
import { ThingEvent, ThingEventId } from '../common/event';
import { UserWithoutPassword, UserId } from '../common/user';
import { UserService } from './user.service';

import {
  RacerUpdatedMessage,
  TeamUpdatedMessage,
  TeamUpdateUpdatedMessage
} from "../common/message";

@Injectable()
export class DataService {

  private headers = new Headers({'Content-Type': 'application/json'});
  private httpNoBodyExtras = {
    headers: this.headers,
    withCredentials: true,
    body: ''
  };
  private httpExtras = {
    headers: this.headers,
    withCredentials: true
  }
  private backendHost = "";
  private baseUrl = this.backendHost + "/r2bcknd/";
  private teamsUrl = this.baseUrl + 'teams';  // URL to web api
  private racersUrl = this.baseUrl + 'racers';
  private updatesUrl = this.baseUrl + "updates";
  private eventsUrl = this.baseUrl + "events";
  private usersUrl = this.baseUrl + "users";
  private publicTeamsUrl = this.baseUrl + 'public/teams';
  private emailUrl = this.baseUrl + "email";
  private errorUrl = this.baseUrl + "exception";

  private teams: Team[] = [];
  private racers: Racer[] = [];
  private updates: TeamUpdate[] = [];

  private teamsChangedListeners = [];
  private racersChangedListeners = [];
  private updatesChangedListeners = [];

  constructor(
    private http: Http,
    private userService: UserService
  ) {
    this.userService.addOnAuthStatusChangedListener(authenticated => {
      if (authenticated) {
        this.whenAuthenticated();
      } else {
        this.notAuthenticated();
      }
    });
  }

  private whenAuthenticated() {
    this.getAllTeamsFromBackend()
    .then(teams => {
      this.teams = teams;
      this.broadcastTeamsChanged();
    })
    this.getRacersFromBackend()
    .then(racers => {
      this.racers = racers;
      this.broadcastRacersChanged();
    })

    this.userService.addSocketEventListener(RacerUpdatedMessage.event, (message) => {
      let racerUpdatedMessage = RacerUpdatedMessage.fromJSON(message);
      let racer = racerUpdatedMessage.racer;
      this.updateRacer(racer);
      this.broadcastRacersChanged();
    });
    this.userService.addSocketEventListener(TeamUpdatedMessage.event, (message) => {
      let teamUpdatedMessage = TeamUpdatedMessage.fromJSON(message);
      let team = teamUpdatedMessage.team;
      this.updateTeam(team);
      this.broadcastTeamsChanged();
    });
    this.userService.addSocketEventListener(TeamUpdateUpdatedMessage.event, (message) => {
      let updateUpdatedMessage = TeamUpdateUpdatedMessage.fromJSON(message);
      console.log(updateUpdatedMessage);
      this.broadcastUpdatesChanged();
    });
  }

  private notAuthenticated() {

  }

  addTeamsChangedListener(callback) {
    this.teamsChangedListeners.push(callback);
  }

  addRacersChangedListener(callback) {
    this.racersChangedListeners.push(callback);
  }

  addUpdatesChangedListener(callback) {
    this.updatesChangedListeners.push(callback);
  }

  private broadcastTeamsChanged() {
    this.teamsChangedListeners.forEach(listener => listener(this.teams));
  }

  private broadcastRacersChanged() {
    this.racersChangedListeners.forEach(listener => listener(this.racers));
  }

  private broadcastUpdatesChanged() {
    this.updatesChangedListeners.forEach(listener => listener(this.updates));
  }

//----------------------------------------------------------------------//

  getPublicTeams(): Promise<Team[]> {
    return this.http.get(this.publicTeamsUrl, this.httpNoBodyExtras)
               .toPromise()
               .then(response => response.json().map(Team.fromJSON))
               .catch(this.handleError);
  }

  getPublicTeam(id: TeamId): Promise<Team> {
    let url = `${this.publicTeamsUrl}/${id}`;
    return this.http.get(url, this.httpNoBodyExtras)
      .toPromise()
      .then(response => Team.fromJSON(response.json()))
      .catch(this.handleError);
  }

//----------------------------------------------------------------------//
  
  getTeams(): Promise<Team[]> {
    return this.getAllTeamsFromBackend();
  }
  
  getAllTeams(): Team[] {
    return this.teams;
  }

  updateTeam(team: Team) {
    for (let i = 0; i < this.teams.length; i++) {
      let t = this.teams[i];
      if (t.id == team.id) {
        this.teams[i] = team;
        return;
      }
    }
  }

  updateTeamAndWriteToBackend(team: Team) {
    this.updateTeam(team);
    return this.writeTeamToBackend(team);
  }

  getAllTeamsFromBackend(): Promise<Team[]> {
    return this.http.get(this.teamsUrl, this.httpNoBodyExtras)
               .toPromise()
               .then(response => response.json().map(Team.fromJSON))
               .catch(this.handleError);
  }

  getTeamFromBackend(id: TeamId): Promise<Team> {
    let url = `${this.teamsUrl}/${id}`;
    return this.http.get(url, this.httpNoBodyExtras)
      .toPromise()
      .then(response => Team.fromJSON(response.json()))
      .catch(this.handleError);
  }

  getTeam(id: TeamId): Team {
    for (let i = 0; i < this.teams.length; i++) {
      let t = this.teams[i];
      if (t.id == id) {
        return t;
      }
    }
  }

  deleteTeam(id: TeamId): Promise<void> {
    let url = `${this.teamsUrl}/${id}`;
    return this.http.delete(url, this.httpNoBodyExtras)
      .toPromise()
      .then(() => null)
      .catch(this.handleError);
  }

  createTeam(properties): Promise<Team> {
    return this.http
      .post(this.teamsUrl, JSON.stringify(properties), this.httpExtras)
      .toPromise()
      .then(res => Team.fromJSON(res.json()))
      .catch(this.handleError);
  }

  writeTeamToBackend(team: Team): Promise<Team> {
    const url = `${this.teamsUrl}/${team.id}`;
    return this.http
      .put(url, JSON.stringify(team), this.httpExtras)
      .toPromise()
      .then(response => {
        let t = Team.fromJSON(response.json())
        return t;
      })
      .catch(this.handleError);
  }

//----------------------------------------------------------------------//
  
  getRacers(): Racer[] {
    return this.racers;
  }

  getRacersFromBackend(): Promise<Racer[]> {
    return this.http.get(this.racersUrl, this.httpNoBodyExtras)
               .toPromise()
               .then(response => response.json().map(Racer.fromJSON))
               .catch(this.handleError);
  }

  getRacerFromBackend(id: RacerId): Promise<Racer> {
    let url = `${this.racersUrl}/${id}`;
    return this.http.get(url, this.httpNoBodyExtras)
      .toPromise()
      .then(response => Racer.fromJSON(response.json()))
      .catch(this.handleError)
  }

  getRacer(id: RacerId): Racer {
    for (let i = 0; i < this.racers.length; i++) {
      let r = this.racers[i];
      if (r.id == id) {
        return r;
      }
    }
  }

  deleteRacer(id: RacerId): Promise<void> {
    let url = `${this.racersUrl}/${id}`;
    return this.http.delete(url, this.httpNoBodyExtras)
      .toPromise()
      .then(() => null)
      .catch(this.handleError);
  }

  createRacer(properties): Promise<Racer> {
    return this.http
      .post(this.racersUrl, JSON.stringify(properties), this.httpExtras)
      .toPromise()
      .then(res => Racer.fromJSON(res.json()))
      .catch(this.handleError);
  }

  updateRacerAndWriteToBackend(racer: Racer): Promise<Racer> {
    this.updateRacer(racer);
    return this.writeRacerToBackend(racer);
  }

  updateRacer(racer: Racer) {
    for (let i = 0; i < this.racers.length; i++) {
      let r = this.racers[i];
      if (r.id == racer.id) {
        this.racers[i] = racer;
      }
    }
  }

  writeRacerToBackend(racer: Racer): Promise<Racer> {
    const url = `${this.racersUrl}/${racer.id}`;
    return this.http
      .put(url, JSON.stringify(racer), this.httpExtras)
      .toPromise()
      .then(response => {
        let r = Racer.fromJSON(response.json())
        return r;
      })
      .catch(this.handleError);
  }

//----------------------------------------------------------------------//

  createStatusUpdateForTeam(statusObj, team: Team): Promise<Team> {
    return this.http.post(this.updatesUrl, JSON.stringify(statusObj), this.httpExtras)
      .toPromise()
      .then(response => {
        let statusUpdate = TeamUpdate.fromJSON(response.json());
        team.statusUpdates.push(statusUpdate);
        this.updateTeamAndWriteToBackend(team);
        return team;
      });
  }

  getRacersWithoutTeams(): Promise<Racer[]> {
    return this.getRacersFromBackend()
      .then(racers => {
        return this.getAllTeamsFromBackend()
          .then(teams => {
            let racersInTeams = teams
              .map(team => team.racers)
              .reduce((a, b) => a.concat(b));
            let comp = (r1, r2) => r1.id === r2.id;
            let remaining = _.differenceWith(racers, racersInTeams, comp);
            return Promise.resolve(remaining);
          });
      });
  }

  getRacerForPhoneNumber(phone: PhoneNumber): Promise<Racer> {
    return this.getRacersFromBackend()
      .then(racers => racers.filter(racer => racer.phones.filter(contact => contact.number === phone))[0]);
  }

  getTeamForRacer(racer: Racer): Promise<Team> {
    return this.getTeams()
      .then(teams => teams.filter(team => team.hasRacer(racer))[0]);
  }

//----------------------------------------------------------------------//

  updateTeamUpdate(update: TeamUpdate): Promise<TeamUpdate> {
    let url = `${this.updatesUrl}/${update.id}`
    return this.http.put(url, JSON.stringify(update), this.httpExtras)
    .toPromise()
    .then(res => TeamUpdate.fromJSON(res.json()))
    .catch(this.handleError);
  }

//----------------------------------------------------------------------//

  getEvents(): Promise<ThingEvent[]> {
    return this.http.get(this.eventsUrl, this.httpNoBodyExtras)
      .toPromise()
      .then(response => response.json().map(ThingEvent.fromJSON))
      .catch(this.handleError);
  }

  getEvent(id: ThingEventId): Promise<ThingEvent> {
    let url = `${this.eventsUrl}/${id}`
    return this.http.get(url, this.httpNoBodyExtras)
      .toPromise()
      .then(response => ThingEvent.fromJSON(response.json()))
      .catch(this.handleError);
  }

  deleteEvent(event: ThingEvent): Promise<ThingEvent> {
    let url = `${this.eventsUrl}/${event.id}`;
    return this.http.delete(url, this.httpNoBodyExtras)
      .toPromise()
      .then(() => null)
      .catch(this.handleError);
  }

  createEvent(properties): Promise<ThingEvent> {
    return this.http
      .post(this.eventsUrl, JSON.stringify(properties), this.httpExtras)
      .toPromise()
      .then(res => ThingEvent.fromJSON(res.json()))
      .catch(this.handleError)
  }

  updateEvent(event: ThingEvent): Promise<ThingEvent> {
    let url = `${this.eventsUrl}/${event.id}`
    return this.http
      .put(url, JSON.stringify(event), this.httpExtras)
      .toPromise()
      .then(response => ThingEvent.fromJSON(response.json()))
      .catch(this.handleError);
  }

//----------------------------------------------------------------------//


  public getUser(username: UserId): Promise<UserWithoutPassword> {
    let url = `${this.usersUrl}/${username}`;
    return this.http.get(url, {withCredentials: true})
    .toPromise()
    .catch(this.handleError)
    .then(response => response.json())
  }

  public getUsers(): Promise<UserWithoutPassword[]> {
    return this.http.get(this.usersUrl, {withCredentials: true})
    .toPromise()
    .catch(this.handleError)
    .then(response => response.json())
  }

  public updateUser(user): Promise<UserWithoutPassword> {
    let url = `${this.usersUrl}/${user.username}`;
    return this.http.put(url, JSON.stringify(user), this.httpExtras)
    .toPromise()
    .catch(this.handleError)
    .then(response => response.json())
  }

  public changeUserPassword(user, password): Promise<UserWithoutPassword> {
    let url = `${this.usersUrl}/${user.username}/change-password`;
    return this.http.put(url, JSON.stringify({password}), this.httpExtras)
    .toPromise()
    .catch(this.handleError)
    .then(response => response.json())
  }

  public createUser(user): Promise<UserWithoutPassword> {
    return this.http.post(this.usersUrl, JSON.stringify(user), this.httpExtras)
    .toPromise()
    .catch(this.handleError)
    .then(response => response.json())
  }

  public deleteUser(username: UserId): Promise<any> {
    let url = `${this.usersUrl}/${username}`;
    return this.http.delete(url, {withCredentials: true})
    .toPromise()
    .catch(this.handleError)
  }

//----------------------------------------------------------------------//
  //
  public sendEmail(to: string, subject: string, html: string) {
    let mailOptions = {
      to: to,
      subject: subject,
      generateTextFromHTML: true,
      html: html
    }
    return this.http.post(this.emailUrl, JSON.stringify(mailOptions), this.httpExtras)
    .toPromise()
    .then(res => res.json())
    .catch(this.handleError)
  }

  public causeError() {
    return this.http.get(this.errorUrl, this.httpNoBodyExtras)
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }
}

