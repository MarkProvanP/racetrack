import { Component } from "@angular/core";
import { UserService } from "../../user.service";

import { prettyUserPrivilegesLevel } from "../../../common/user";

@Component({
  selector: 'me',
  styleUrls: ['./me.style.scss'],
  templateUrl: './me.template.html'
})
export class MeComponent {
  constructor(private userService: UserService) {
    
  }

  prettyLevelName(level) {
    return prettyUserPrivilegesLevel(Number(level));
  }

  getUser() {
    return this.userService.getUser()
  }
}
