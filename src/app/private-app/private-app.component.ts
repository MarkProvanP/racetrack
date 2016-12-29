/*
 * Angular 2 decorators and services
 */
import { Component, ViewEncapsulation } from '@angular/core';
import { Title } from "@angular/platform-browser";
import { TextService, TextFilterOptions } from '../text.service';
import { UserService } from '../user.service';
import { DataService } from '../data.service';

/*
 * App Component
 * Top Level Component
 */
@Component({
  selector: 'private-app',
  encapsulation: ViewEncapsulation.None,
  styleUrls: [
    './private-app.style.scss'
  ],
  templateUrl: './private-app.template.html'
})
export class PrivateApp {
  angularclassLogo = 'assets/img/angularclass-avatar.png';
  loading = false;
  name = process.env.APP_NAME;
  url = 'https://twitter.com/AngularClass';
  recentTextsReceived = [];

  constructor(
    private textService: TextService,
    private titleService: Title,
    private userService: UserService,
    private dataService: DataService
  ) {}

  toolbarClass() {
    if (this.getNumberUnreadTexts()) {
      return 'toolbar-warning';
    } else {
      return 'toolbar-normal';
    }
  }

  ngOnInit() {
    this.textService.addTextReceivedCallback(text => this.onTextReceived(text));
    this.textService.addTextsChangedCallback(texts => this.onTextsChanged());
    this.setTitle();
  }

  getUnreadTextsNotification() {
    let unread = this.getNumberUnreadTexts();
    if (unread == 1) {
      return "1 unread text!";
    } else {
      return `${unread} unread texts!`;
    }
  }

  getTimezone() {
    return this.userService.getTimezone();
  }

  toggleGlobalTimezone() {
    this.userService.toggleGlobalTimezone();
  }

  setTitle() {
    let unread = this.getNumberUnreadTexts()
    let normal = 'Race2 Dashboard';
    let title;
    if (unread) {
      title = `(${unread}) ${normal}`;
    } else {
      title = normal;
    }
    console.log('setting title to', title);
    this.titleService.setTitle(title);
  }

  onTextReceived(text: Text) {
    console.log('received text', text);
    this.setTitle();
  }

  onTextsChanged() {
    this.setTitle();
  }

  getNumberUnreadTexts() {
    return this.getUnreadTexts().length;
  }

  getUnreadTexts() {
    let filterOptions = new TextFilterOptions({read: false});
    return this.textService.getTextsFiltered(filterOptions);
  }

  loggedIn() {
    return this.userService.isAuthenticated();
  }

  getUsername() {
    if (this.userService.getUser()) {
      return this.userService.getUser().name;
    }
  }

  getOtherUsers() {
    return this.userService.getOtherLoggedInUsers();
  }
}

/*
 * Please review the https://github.com/AngularClass/angular2-examples/ repo for
 * more angular app examples that you may copy/paste
 * (The examples may not be updated as quickly. Please open an issue on github for us to update it)
 * For help or questions please contact us at @AngularClass on twitter
 * or our chat on Slack at https://AngularClass.com/slack-join
 */
