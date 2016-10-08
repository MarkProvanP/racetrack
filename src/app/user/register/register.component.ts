import { Component, OnInit } from "@angular/core";
import { REACTIVE_FORM_DIRECTIVES, FormGroup, FormControl, Validators } from "@angular/forms";
import { Router } from "@angular/router";

import { UserService } from '../../user.service';

@Component({
  selector: 'register',
  styleUrls: ['./register.style.scss'],
  templateUrl: './register.template.html',
  directives: [REACTIVE_FORM_DIRECTIVES]
})
export class RegisterComponent implements OnInit {
  username: FormControl;
  password: FormControl;
  form: FormGroup;

  constructor(private userService: UserService) {

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
    debugger;
    this.userService.register(this.form.value)
      .then(data => {
        debugger;
        console.log(data);
      })
      .catch(err => {
        console.log(err);
        debugger;
      });
  }
}