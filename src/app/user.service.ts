import { Injectable } from "@angular/core";
import { Headers, Http } from "@angular/http";
import 'rxjs/add/operator/toPromise';

@Injectable()
export class UserService {
  private headers = new Headers({'Content-Type': 'application/json'});
  private backendHost = "";
  private baseUrl = this.backendHost + "/r2bcknd/auth/api/";
  private loginUrl = this.baseUrl + "login";
  private logoutUrl = this.baseUrl + "logout";
  private registerUrl = this.baseUrl + "register";
  private authenticatedUrl = this.baseUrl = "authenticated";
  private meUrl = this.baseUrl + "me";

  private authenticated: boolean = false;

  constructor(private http: Http) {
    this.authenticate()
      .then(val => {console.log('auth status:', val)});
  }

  authenticate(): Promise<any> {
    return this.http
      .get(this.authenticatedUrl, {headers: this.headers, withCredentials: true})
      .toPromise()
      .then(response => {
        this.authenticated = response.json().authenticated;
        return this.authenticated;
      })
      .catch(err => {
        this.authenticated = false;
        return this.authenticated;
      })
  }

  login(user): Promise<any> {
    return this.http
      .post(this.loginUrl, JSON.stringify(user), {headers: this.headers, withCredentials: true})
      .toPromise()
      .then(response => {
        this.authenticated = true;
        return response.json()
      })
      .catch(this.handleError)
  }

  logout(): Promise<any> {
    return this.http
      .get(this.logoutUrl, {withCredentials: true})
      .toPromise()
      .then(response => {
        this.authenticated = false;
        return response.json()
      })
      .catch(this.handleError)
  }

  register(user): Promise<any> {
    console.log('user service register user', user);
    return this.http
      .post(this.registerUrl, JSON.stringify(user), {headers: this.headers, withCredentials: true})
      .toPromise()
      .then(response => {
        this.authenticated = true;
        return response.json()
      })
      .catch(this.handleError)
  }

  getMe(): Promise<any> {
    return this.http
      .get(this.meUrl, {withCredentials: true})
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError)
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }

  isAuthenticated() {
    return this.authenticated;
  }
}
