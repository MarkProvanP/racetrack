import { Component, OnInit } from "@angular/core";
import { UserService } from "../../user.service";

@Component({
  selector: 'me',
  styleUrls: ['./me.style.scss'],
  templateUrl: './me.template.html'
})
export class MeComponent implements OnInit {
  constructor(private userService: UserService) {
    
  }

  getUser() {
    return this.userService.getUser()
  }
}
