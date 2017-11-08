import { Component } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { Router } from "@angular/router";

import { MatSnackBar } from "@angular/material";

import { UserService } from '../../user.service';

@Component({
  selector: 'set-password',
  styleUrls: ['./set-password.component.scss'],
  templateUrl: './set-password.component.pug'
})
export class SetPasswordComponent {
  password: FormControl;
  passwordAgain: FormControl;
  form: FormGroup;
  passwordError: boolean;

  constructor(
    private userService: UserService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.passwordAgain = new FormControl('', Validators.required);
    this.password = new FormControl('', Validators.required);

    this.form = new FormGroup({
      'password': this.password,
      'passwordAgain': this.passwordAgain
    },
    this.matchingPasswords('password', 'passwordAgain')
    );
  }

  matchingPasswords(passwordKey: string, passwordAgainKey: string) {
    return (group: FormGroup) => {
      let passwordInput = group.get(passwordKey);
      let passwordAgainInput = group.get(passwordAgainKey);
      if (passwordInput.value !== passwordAgainInput.value) {
        this.passwordError = true;
        return {mismatch: true}
      } else {
        this.passwordError = false;
      }
    }
  }

  onSubmit() {
    if (this.form.valid) {
      this.passwordError = false;
      this.userService.changePassword(
        this.form.value.password
      )
      .then(success => {
        this.form.reset();
        this.snackBar.open('Password changed!')
        this.router.navigate(['/safetyteam']);
      })
      .catch(err => {
        this.snackBar.open('Something went wrong!')
      })
    } else {
      this.passwordError = true;
    }
  }

  getPasswordErrorMessage() {
    return "Passwords must match!";
  }
}
