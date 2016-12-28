import { Component } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { Router } from "@angular/router";

import { UserService } from '../../user.service';

@Component({
  selector: 'login',
  styleUrls: ['./login.component.scss'],
  templateUrl: './login.component.pug'
})
export class LoginComponent {
  username: FormControl;
  password: FormControl;
  form: FormGroup;
  loginError: boolean;

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit() {
    this.username = new FormControl('', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(64)]));
    this.password = new FormControl('', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(32)]));

    this.form = new FormGroup({
      'username': this.username,
      'password': this.password,
    });
  }

  onSubmit() {
    this.userService.login(this.form.value)
      .then(data => {
        this.loginError = false;
        this.router.navigate(['/safetyteam']);
      })
      .catch(err => {
        this.loginError = true;
      });
  }

  getLoginErrorMessage() {
    return "Invalid credentials! Try again!";
  }
}
