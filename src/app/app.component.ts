/*
 * Angular 2 decorators and services
 */
import { Component, ViewEncapsulation } from '@angular/core';
import { Title } from "@angular/platform-browser";
import { TextService, TextFilterOptions } from './text.service';
import { UserService } from './user.service';

/*
 * App Component
 * Top Level Component
 */
@Component({
  selector: 'app',
  encapsulation: ViewEncapsulation.None,
  styleUrls: [
    './app.style.scss'
  ],
  templateUrl: './app.template.html'
})
export class App {
  angularclassLogo = 'assets/img/angularclass-avatar.png';
  loading = false;
  name = 'Race 2 Prague';
  url = 'https://twitter.com/AngularClass';
  recentTextsReceived = [];

  constructor(
    private textService: TextService,
    private titleService: Title,
    private userService: UserService
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
    return "derp";
  }
}

/*
 * Please review the https://github.com/AngularClass/angular2-examples/ repo for
 * more angular app examples that you may copy/paste
 * (The examples may not be updated as quickly. Please open an issue on github for us to update it)
 * For help or questions please contact us at @AngularClass on twitter
 * or our chat on Slack at https://AngularClass.com/slack-join
 */
