/*
 * Angular 2 decorators and services
 */
import { Component, ViewEncapsulation } from '@angular/core';

import { TextService, TextFilterOptions } from './text.service';

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

  constructor(
    private textService: TextService
  ) {

  }

  ngOnInit() {
  }

  onTextReceived(text: Text) {
  }

  getNumberUnreadTexts() {
    let filterOptions = new TextFilterOptions({read: false});
    return this.textService.getTextsFiltered(filterOptions).length;
  }
}

/*
 * Please review the https://github.com/AngularClass/angular2-examples/ repo for
 * more angular app examples that you may copy/paste
 * (The examples may not be updated as quickly. Please open an issue on github for us to update it)
 * For help or questions please contact us at @AngularClass on twitter
 * or our chat on Slack at https://AngularClass.com/slack-join
 */
