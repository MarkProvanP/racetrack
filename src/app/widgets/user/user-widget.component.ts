import { Component, OnInit, Input } from "@angular/core";

import { UserId, UserWithoutPassword } from "../../../common/user";

import { DataService } from "../../data.service";

@Component({
  selector: 'user-widget',
  templateUrl: './user-widget.component.pug',
  styleUrls: ['./user-widget.component.scss']
})
export class UserWidget implements OnInit {
  @Input("user") userId: UserId;
  user: UserWithoutPassword
  loaded: boolean;
  error: boolean;

  constructor(
    private dataService: DataService
  ) {}

  ngOnInit() {
    this.loaded = false;
    if (!this.userId) {
      return;
    }
    this.dataService.getUser(this.userId)
    .then(user => {
      this.user = user;
      this.loaded = true;
    })
    .catch(err => {
      this.error = err;
    })
  }

  getTooltip() {
    if (this.user.phone && this.user.role) {
      return `${this.user.name} - phone: ${this.user.phone.toE164()}, role: ${this.user.role}`;
    } else {
      return this.user.name;
    }
  }
}
