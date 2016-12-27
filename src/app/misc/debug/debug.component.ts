import { Component } from "@angular/core";

import { DataService } from "../../data.service";
import { UserService } from "../../user.service";
import { TextService } from "../../text.service";

@Component({
  selector: 'debug-component',
  templateUrl: './debug.component.pug',
  styleUrls: ['./debug.component.scss']
})
export class DebugComponent {
  email = {
    to: "",
    subject: "",
    body: ""
  }

  constructor(
    private dataService: DataService,
    private userService: UserService,
    private textService: TextService
  ) {}

  sendEmail() {
    this.dataService.sendEmail(this.email.to, this.email.subject, this.email.body)
    .then(res => console.log(res))
  }

  causeCrash() {
    this.dataService.causeError();
  }
}
