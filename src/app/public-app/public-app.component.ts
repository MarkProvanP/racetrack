/*
 * Angular 2 decorators and services
 */
import { Component, ViewEncapsulation } from '@angular/core';
import { Title } from "@angular/platform-browser";
import { UserService } from '../user.service';
import { DataService } from '../data.service';

/*
 * App Component
 * Top Level Component
 */
@Component({
  selector: 'public-app',
  encapsulation: ViewEncapsulation.None,
  styleUrls: [
    './public-app.style.scss'
  ],
  templateUrl: './public-app.template.html'
})
export class PublicApp {
  angularclassLogo = 'assets/img/angularclass-avatar.png';
  loading = false;
  name = 'Race 2 Prague';
  url = 'https://twitter.com/AngularClass';
  recentTextsReceived = [];

  constructor(
    private titleService: Title,
    private userService: UserService,
    private dataService: DataService
  ) {}

  ngOnInit() {
  }
}

/*
 * Please review the https://github.com/AngularClass/angular2-examples/ repo for
 * more angular app examples that you may copy/paste
 * (The examples may not be updated as quickly. Please open an issue on github for us to update it)
 * For help or questions please contact us at @AngularClass on twitter
 * or our chat on Slack at https://AngularClass.com/slack-join
 */
