import { Component, OnInit } from "@angular/core";
import { Headers, Http } from "@angular/http"

import { DataService } from "../../data.service";
import { UserService } from "../../user.service";
import { TextService } from "../../text.service";

import { PhoneNumber } from "../../../common/text";

import { Team } from "../../../common/team";

import * as moment from "moment"

import randomColor = require("randomcolor");

@Component({
  selector: 'debug-component',
  templateUrl: './debug.component.pug',
  styleUrls: ['./debug.component.scss']
})
export class DebugComponent implements OnInit {
  private headers = new Headers({'Content-Type': 'application/json'});
  private httpExtras = {
    headers: this.headers,
    withCredentials: true
  }
  apiRequest = {
    method: undefined,
    endpoint: undefined,
    body: undefined
  }
  apiResponse;

  email = {
    to: "",
    subject: "",
    body: ""
  }

  teams: Team[] = [];

  constructor(
    private dataService: DataService,
    private userService: UserService,
    private textService: TextService,
    private http: Http
  ) {}

  ngOnInit() {

  }

  makeApiCall() {
    let httpMethod;
    console.log('makeApiCall', this.apiRequest)
    switch (this.apiRequest.method) {
      case 'get': httpMethod = this.http.get; break;
      case 'post': httpMethod = this.http.post; break;
      case 'put': httpMethod = this.http.put; break;
      case 'delete': httpMethod = this.http.delete; break;
      default: return
    }

    this.http[this.apiRequest.method](this.apiRequest.endpoint, this.apiRequest.body, this.httpExtras)
    .toPromise()
    .then(res => this.apiResponse = res.text());
  }

  textNumber(number) {
    return PhoneNumber.parse(number);
  }
  
  textTime(obj) {
    return moment(obj.date_created, 'ddd, DD MMM YYYY HH:mm:ss ZZ').toDate();
  }

  loadTeams() {
    this.dataService.getTeamsFromBackend()
    .then(teams => this.teams = teams)
  }

  prettyColors() {
    this.teams.forEach(team => {
      team.color = randomColor();
      this.dataService.updateTeamAndWriteToBackend(team);
    })
  }

  sendEmail() {
    this.dataService.sendEmail(this.email.to, this.email.subject, this.email.body)
    .then(res => console.log(res))
  }

  currentlyFetchingTwilio: boolean;
  allTwilioTexts = []

  twilioFetchBegin() {
    console.log('begin fetching twilio')
    this.textService.twilioFetchBegin()
    this.currentlyFetchingTwilio = true
  }

  twilioFetchCheck() {
    console.log('check twilio results')
    this.textService.twilioFetchCheck()
    .then(results => this.allTwilioTexts = results)
  }
}
