import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { FormGroup, FormControl, Validators } from "@angular/forms";

import { UserId, UserWithoutPassword, prettyUserPrivilegesLevel, UserPrivileges } from '../../../common/user';
import { UserService } from "../../user.service";
import { DataService } from "../../data.service";

@Component({
  selector: 'user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {
  users: UserWithoutPassword[];
  username: FormControl;
  password: FormControl;
  name: FormControl;
  email: FormControl;
  phone: FormControl;
  form: FormGroup;
  privilegesEnum = UserPrivileges;
  selectedLevel: UserPrivileges = UserPrivileges.VIEW_ONLY;
  currentlyEditingUser: UserWithoutPassword;

  constructor(
    private userService: UserService,
    private dataService: DataService,
    private router: Router
  ) {
    this.loadUsers();
  }

  prettyLevelName(level) {
    return prettyUserPrivilegesLevel(Number(level));
  }

  loadUsers() {
    this.dataService.getUsers()
    .then(users => this.users = users);
  }

  resetPassword(user: UserWithoutPassword) {
    let newPassword = prompt(`Enter new password for ${user.username}`);
    if (newPassword) {
      this.dataService.changeUserPassword(user, newPassword)
      .then(res => console.log('Password updated!'));
    }
  }

  ngOnInit() {
    this.username = new FormControl('', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(64)]));
    this.password = new FormControl('', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(32)]));
    this.name= new FormControl('', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(64)]));
    this.email= new FormControl('', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(32)]));
    this.phone= new FormControl('', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(64)]));

    this.form = new FormGroup({
      'username': this.username,
      'password': this.password,
      'name': this.name,
      'email': this.email,
      'phone': this.phone
    });
  }

  isLevelDisabled(level) {
    let b = Number(level) == UserPrivileges.SUPERUSER;
    return b ? true : null;
  }

  deleteUser(username: UserId) {
    this.dataService.deleteUser(username)
    .then(() => this.loadUsers());
  }

  isEditingUser(user) {
    return user == this.currentlyEditingUser;
  }

  editUser(user) {
    this.currentlyEditingUser = user;
  }

  stopEditingUser() {
    this.currentlyEditingUser = undefined;
  }

  saveUser() {
    this.dataService.updateUser(this.currentlyEditingUser)
    .then(success => {
      this.stopEditingUser()
      this.loadUsers();
    });
  }

  onSubmit() {
    let formValue = this.form.value;
    formValue.level = this.selectedLevel;
    this.dataService.createUser(formValue)
    .then(res => this.loadUsers())
    .catch(err => {
      console.log(err);
    });
  }
}
