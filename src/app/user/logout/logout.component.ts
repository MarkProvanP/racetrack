import { Component } from "@angular/core";
import { UserService } from '../../user.service';

@Component({
  selector: 'logout',
  styleUrls: ['./logout.style.scss'],
  templateUrl: './logout.template.html'
})
export class LogoutComponent {
  constructor(private userService: UserService) {

  }

  logout() {
    this.userService.logout()
      .then(response => {
        console.log('response', response);
      });
  }
}
