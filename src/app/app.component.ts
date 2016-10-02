/*
 * Angular 2 decorators and services
 */
import { Component, ViewEncapsulation } from '@angular/core';

import { AppState } from './app.service';

import { TextService } from './text.service';

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

  numberUnreadTexts: number;

  constructor(
    public appState: AppState,
    private textService: TextService
  ) {

  }

  ngOnInit() {
    console.log('Initial App State', this.appState.state);
    this.getNumberUnreadTexts();
    this.textService.onTextReceived(text => this.onTextReceived(text));
  }

  onTextReceived(text: Text) {
    this.getNumberUnreadTexts();
  }

  getNumberUnreadTexts() {
    this.textService.getTexts()
      .then(texts => this.numberUnreadTexts = texts.filter(text => !text.read).length)
  }
}

/*
 * Please review the https://github.com/AngularClass/angular2-examples/ repo for
 * more angular app examples that you may copy/paste
 * (The examples may not be updated as quickly. Please open an issue on github for us to update it)
 * For help or questions please contact us at @AngularClass on twitter
 * or our chat on Slack at https://AngularClass.com/slack-join
 */
