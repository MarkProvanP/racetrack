import { Injectable } from "@angular/core";
import { Location } from "@angular/common";
import { Headers, Http } from "@angular/http";
import 'rxjs/add/operator/toPromise';
import { Observable } from 'rxjs/Observable';
import { MdSnackBar, MdSnackBarConfig } from "@angular/material";

import * as io from "socket.io-client";

import {
  UserLoggedInMessage,
  UserLoggedOutMessage,
  OtherLoggedInUsersMessage,
  CLOSE_SOCKET
} from "../common/message";
import { UserWithoutPassword, UserActionInfo, UserId } from "../common/user";

function myIndexOf(array, element, check) {
  for (let i = 0; i < array.length; i++) {
    if (check(array[i], element)) {
      return i;
    }
  }
  return -1;
}

export interface Timezone {
  short: string,
  long: string
}

const SOCKET_IO_OPTS = {};

export const TIMEZONES = {
  UK: {
    short: "GMT",
    long: "Europe/London"
  },
  EU: {
    short: "CET",
    long: "Europe/Prague"
  }
}

@Injectable()
export class UserService {
  private headers = new Headers({'Content-Type': 'application/json'});
  private httpExtras = {
    headers: this.headers,
    withCredentials: true
  }

  private backendHost = "";
  private baseUrl = this.backendHost + "/r2bcknd/auth/";
  private loginUrl = this.baseUrl + "api/login";
  private logoutUrl = this.baseUrl + "api/logout";
  private authenticatedUrl = this.baseUrl + "api/authenticated";
  private meUrl = this.authenticatedUrl//this.baseUrl + "me";
  private usersUrl = this.baseUrl + "users";
  private changePasswordUrl = this.baseUrl + "api/change-password"
  private authApi = this.baseUrl + "api/auth";

  private authenticated;
  private authenticateObservable = Observable.of(undefined);
  private user: UserWithoutPassword;
  private otherUsers: UserWithoutPassword[] = [];

  private timezone: Timezone = TIMEZONES.UK;

  private authenticatedStatusListeners = [];
  private otherUsersListeners = [];
  private timezoneChangedListeners = [];

  private socketIoHost = "";//"https://mrp4.host.cs.st-andrews.ac.uk";
  private socket;

  private socketEventListenerMap = {};

  addSocketEventListener(event, callback) {
    if (!this.socketEventListenerMap[event]) {
      this.socketEventListenerMap[event] = [];
      this.socket.on(event, (m) => {
        this.socketEventListenerMap[event].forEach(callback => callback(m));
      })
    }
    this.socketEventListenerMap[event].push(callback);
  }

  private whenAuthenticated() {
    if (this.socket) {
      console.error("socket already exists!");
    }
    this.socket = io(this.socketIoHost, SOCKET_IO_OPTS);
    this.socket.on('connect', () => {
    });
    this.socket.on('connect_error', () => {
      console.error('Socket io connection error!');
    });
    // I don't know why, but the socket.emit() call in the server upon-login code
    // results in this message being pre-parsed as an object
    this.socket.on(OtherLoggedInUsersMessage.event, (message) => {
      let otherUsersMessage = OtherLoggedInUsersMessage.fromJSON(message);
      this.otherUsers = otherUsersMessage.users;
    })
    // These messages, however, come as strings?
    this.socket.on(UserLoggedInMessage.event, (message) => {
      let loggedInMessage = UserLoggedInMessage.fromJSON(message);
      let u = loggedInMessage.user;
      if (u.username != this.user.username) {
        this.otherUsers.push(u);
      }
    });
    this.socket.on(UserLoggedOutMessage.event, (message) => {
      let loggedOutMessage = UserLoggedOutMessage.fromJSON(message);
      let u = loggedOutMessage.user;
      let index = myIndexOf(this.otherUsers, u, (u1, u2) => u1.username == u2.username)
      if (index != -1) {
        this.otherUsers.splice(index, 1);
      }
    });
  }

  private notAuthenticated() {
    this.socket.emit(CLOSE_SOCKET);
    this.socket = undefined;
  }

  constructor(
    private http: Http,
    private location: Location,
    private snackBar: MdSnackBar
  ) {
    this.auth()
    .toPromise()
    .then(response => {
      if (response.auth) {
        this.getMe();
      }
    })
    .catch(err => {
      console.log('error on auth()')
    })
  }

  public addOnAuthStatusChangedListener(callback) {
    this.authenticatedStatusListeners.push(callback);
    callback(this.authenticated);
  }

  public addOtherUsersListener(callback) {
    this.otherUsersListeners.push(callback);
    callback(this.otherUsers);
  }

  public addTimezoneChangedListener(callback) {
    this.timezoneChangedListeners.push(callback);
    callback(this.timezone);
  }

  private broadcastAuthStatus() {
    this.authenticatedStatusListeners.forEach(listener => listener(this.authenticated));
  }

  private broadcastOtherUsers() {
    this.otherUsersListeners.forEach(listener => listener(this.otherUsers));
  }

  private broadcastTimezoneChanged() {
    this.timezoneChangedListeners.forEach(listener => listener(this.timezone));
  }

  private setUser(user): Promise<any> {
    if (this.authenticated && this.user.username == user.username) {
      return Promise.resolve(user);
    }
    this.authenticated = true;
    this.whenAuthenticated();
    this.broadcastAuthStatus();
    this.user = user;
    return Promise.resolve(user);
  }

  private setNotAuthenticated() {
    this.authenticated = false;
    this.user = undefined;
    this.broadcastAuthStatus();
    this.notAuthenticated();
  }

  auth() {
    return this.http.get(this.authApi, this.httpExtras)
      .map(res => res.json())
      .catch(this.handleError)
  }

  login(user): Promise<any> {
    return this.http
      .post(this.loginUrl, JSON.stringify(user), this.httpExtras)
      .toPromise()
      .catch(this.handleError)
      .then(response => {
        return response.json()
      })
      .then(user => UserWithoutPassword.fromJSON(user))
      .then(user => this.setUser(user))
  }

  logout(): Promise<any> {
    return this.http
      .get(this.logoutUrl, this.httpExtras)
      .toPromise()
      .catch(this.handleError)
      .then(response => {
        this.setNotAuthenticated();
        return response.json()
      })
  }

  changePassword(password: string): Promise<any> {
    return this.http
    .put(this.changePasswordUrl, JSON.stringify({password}), this.httpExtras)
    .toPromise()
    .catch(this.handleError)
  }

  getMe(): Promise<UserWithoutPassword> {
    return this.http
      .get(this.meUrl, this.httpExtras)
      .toPromise()
      .catch(this.handleError)
      .then(response => response.json())
      .then(user => UserWithoutPassword.fromJSON(user))
      .then(user => {
        this.setUser(user);
        return user;
      });
  }

  public isAuthenticated() {
    return this.authenticated;
  }

  getUser(): UserWithoutPassword {
    return this.user;
  }

  getOtherLoggedInUsers(): UserWithoutPassword[] {
    return this.otherUsers;
  }

  private handleError(error: any): Promise<any> {
    this.snackBar.open('A User Service error occured!', 'Dismiss')
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }

  getTimezone() {
    return this.timezone;
  }

  toggleGlobalTimezone() {
    if (this.timezone == TIMEZONES.UK) {
      this.timezone = TIMEZONES.EU;
    } else {
      this.timezone = TIMEZONES.UK;
    }
    this.broadcastTimezoneChanged();
  }

  public getUserAction() {
    let userAction = {
      user: this.getUser().username,
      timestamp: new Date()
    } as UserActionInfo;
    return userAction;
  }
}
