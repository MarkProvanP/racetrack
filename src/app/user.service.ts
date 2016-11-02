import { Injectable } from "@angular/core";
import { Headers, Http } from "@angular/http";
import 'rxjs/add/operator/toPromise';
import { Observable } from 'rxjs/Observable';

import { UserActionInfo } from "../common/user";

@Injectable()
export class UserService {
  private headers = new Headers({'Content-Type': 'application/json'});
  private backendHost = "";
  private baseUrl = this.backendHost + "/r2bcknd/auth/api/";
  private loginUrl = this.baseUrl + "login";
  private logoutUrl = this.baseUrl + "logout";
  private registerUrl = this.baseUrl + "register";
  private authenticatedUrl = this.baseUrl + "authenticated";
  private meUrl = this.baseUrl + "me";

  private authenticated: boolean = false;
  private user;

  private authenticatedStatusListeners = [];

  constructor(private http: Http) {
    this.authenticate()
      .then(authenticated => {
        
      });
  }

  public addOnAuthStatusChangedListener(callback) {
    this.authenticatedStatusListeners.push(callback);
    callback(this.authenticated);
  }

  private broadcastAuthStatus() {
    this.authenticatedStatusListeners.forEach(listener => listener(this.authenticated));
  }

  private setUser(user): Promise<any> {
    if (this.authenticated && this.user.username == user.username) {
      return Promise.resolve(user);
    }
    this.authenticated = true;
    console.log('setting authenticated to true');
    this.broadcastAuthStatus();
    this.user = user;
    return Promise.resolve(user);
  }

  private setNotAuthenticated() {
    this.authenticated = false;
    this.user = undefined;
    this.broadcastAuthStatus();
  }

  authenticate(): Promise<any> {
    return this.http
      .get(this.authenticatedUrl, {headers: this.headers, withCredentials: true, body: ''})
      .toPromise()
      .then(response => {
        console.log('authenticated!');
        this.setUser(response.json());
        return this.authenticated;
      })
      .catch(err => {
        console.log('not authenticated', err);
        this.setNotAuthenticated();
        return this.authenticated;
      })
  }

  authenticatedCheck(): Observable<any> {
    return Observable.of(this.authenticated);
  }

  login(user): Promise<any> {
    return this.http
      .post(this.loginUrl, JSON.stringify(user), {headers: this.headers, withCredentials: true})
      .toPromise()
      .catch(this.handleHttpError)
      .then(response => {
        console.log('login response', response);
        return response.json()
      })
      .then(user => this.setUser(user))
  }

  logout(): Promise<any> {
    return this.http
      .get(this.logoutUrl, {withCredentials: true})
      .toPromise()
      .catch(this.handleHttpError)
      .then(response => {
        this.setNotAuthenticated();
        return response.json()
      })
  }

  register(user): Promise<any> {
    console.log('user service register user', user);
    return this.http
      .post(this.registerUrl, JSON.stringify(user), {headers: this.headers, withCredentials: true})
      .toPromise()
      .catch(this.handleHttpError)
      .then(response => {
        console.log('register response', response);
        return response.json()
      })
      .then(user => this.setUser(user))
  }

  getMe(): Promise<any> {
    return this.http
      .get(this.meUrl, {withCredentials: true})
      .toPromise()
      .catch(this.handleHttpError)
      .then(response => response.json())
      .then(user => this.setUser(user))
  }

  private handleHttpError(error: any): Promise<any> {
    console.log('UserService handleHttpError', error);
    return Promise.reject(error);
  }

  public isAuthenticated() {
    return this.authenticated;
  }

  getUser() {
    return this.user;
  }

  public getUserAction() {
    let userAction = {
      user: this.getUser(),
      timestamp: new Date()
    } as UserActionInfo;
    return userAction;
  }
}
