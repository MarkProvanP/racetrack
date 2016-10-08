import { Component } from "@angular/core";
import { REACTIVE_FORM_DIRECTIVES, FormGroup, FormControl, Validators } from "@angular/forms";
import { Router } from "@angular/router";

import { UserService } from '../../user.service';

@Component({
  selector: 'login',
  styleUrls: ['./login.style.scss'],
  templateUrl: './login.template.html',
  directives: [REACTIVE_FORM_DIRECTIVES]
})
export class LoginComponent {
  username: FormControl;
  password: FormControl;
  form: FormGroup;

  constructor(private userService: UserService, private router: Router) {

  }

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
        this.router.navigate(['/']);
      })
      .catch(err => {
        console.log(err);
      });
  }
}
