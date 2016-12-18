import { Component, Input } from "@angular/core";

import { UserWithoutPassword } from "../../../common/user";

@Component({
  selector: 'user-widget',
  templateUrl: './user-widget.component.html',
  styleUrls: ['./user-widget.component.scss']
})
export class UserWidget {
  @Input() user: UserWithoutPassword

  getTooltip() {
    return `${this.user.name} - phone: ${this.user.phone}, role: ${this.user.role}`;
  }
}
