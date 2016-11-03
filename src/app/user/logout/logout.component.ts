import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { UserService } from '../../user.service';

@Component({
  selector: 'logout',
  styleUrls: ['./logout.style.scss'],
  templateUrl: './logout.template.html'
})
export class LogoutComponent implements OnInit {
  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit() {
    this.userService.logout()
      .then(response => {
        console.log('response', response);
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 1000);
      });
  }
}
