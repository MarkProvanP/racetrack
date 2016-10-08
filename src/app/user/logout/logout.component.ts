import { Component, OnInit } from "@angular/core";
import { UserService } from '../../user.service';

@Component({
  selector: 'logout',
  styleUrls: ['./logout.style.scss'],
  templateUrl: './logout.template.html'
})
export class LogoutComponent implements OnInit {
  constructor(private userService: UserService) {

  }

  ngOnInit() {
    this.userService.logout()
      .then(response => {
        console.log('response', response);
      });
  }
}
