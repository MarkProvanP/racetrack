import { Component, OnInit } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";

import { MatSnackBar } from "@angular/material";

import { UserService } from "../../user.service";
import { DataService } from "../../data.service";

import { prettyUserPrivilegesLevel } from "../../../common/user";

@Component({
  selector: 'me',
  styleUrls: ['./me.component.scss'],
  templateUrl: './me.component.pug'
})
export class MeComponent implements OnInit {
  newPassword: FormControl;
  newPasswordAgain: FormControl;
  changePassword: FormGroup;
  changePasswordError: boolean = false;

  constructor(
    private userService: UserService,
    private dataService: DataService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    this.newPassword = new FormControl('', Validators.compose([Validators.required]));
    this.newPasswordAgain = new FormControl('', Validators.compose([Validators.required]));

    this.changePassword = new FormGroup({
      'newPassword': this.newPassword,
      'newPasswordAgain': this.newPasswordAgain
    },
    this.matchingPasswords('newPassword', 'newPasswordAgain'))
  }

  matchingPasswords(passwordKey: string, passwordAgainKey: string) {
    return (group: FormGroup) => {
      let passwordInput = group.get(passwordKey);
      let passwordAgainInput = group.get(passwordAgainKey);
      if (passwordInput.value !== passwordAgainInput.value) {
        this.changePasswordError = true;
        return {mismatch: true}
      } else {
        this.changePasswordError = false;
      }
    }
  }

  prettyLevelName(level) {
    return prettyUserPrivilegesLevel(Number(level));
  }

  getUser() {
    return this.userService.getUser()
  }

  getChangePasswordErrorMessage() {
    return "Passwords must match!"
  }

  onChangePasswordSubmit() {
    if (this.changePassword.valid) {
      this.changePasswordError = false;
      this.userService.changePassword(
        this.changePassword.value.newPassword
      )
      .then(success => {
        this.changePassword.reset();
        this.snackBar.open('Password changed!')
      })
      .catch(err => {
        this.snackBar.open('Something went wrong!')
      })
    } else {
      this.changePasswordError = true;
    }
  }
}
