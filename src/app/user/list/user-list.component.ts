import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { FormGroup, FormControl, Validators } from "@angular/forms";

import * as Papa from "papaparse";

import { UserId, UserWithoutPassword, prettyUserPrivilegesLevel, isAboveMinimumPrivilege, UserPrivileges } from '../../../common/user';
import { UserService } from "../../user.service";
import { DataService } from "../../data.service";

@Component({
  selector: 'user-list',
  templateUrl: './user-list.component.pug',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {
  users: UserWithoutPassword[];
  username: FormControl;
  name: FormControl;
  email: FormControl;
  phone: FormControl;
  role: FormControl;
  form: FormGroup;
  privilegesEnum = UserPrivileges;
  selectedLevel: UserPrivileges = UserPrivileges.VIEW_ONLY;
  currentlyEditingUser: UserWithoutPassword;

  bulkUsers: UserWithoutPassword[];

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
    this.dataService.getUsersFromBackend()
    .then(users => this.users = users);
  }

  resetPassword(user: UserWithoutPassword) {
    this.dataService.resetUserPassword(user)
    .then(res => console.log('Password updated!'));
  }

  ngOnInit() {
    this.username = new FormControl('', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(64)]));
    this.name= new FormControl('', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(64)]));
    this.email= new FormControl('', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(32)]));
    this.phone= new FormControl('', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(64)]));
    this.role = new FormControl('', Validators.maxLength(64));

    this.form = new FormGroup({
      'username': this.username,
      'name': this.name,
      'email': this.email,
      'phone': this.phone,
      'role': this.role
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

  canModify(user: UserWithoutPassword) {
    if (user.username == 'admin') return false;
    let me = this.userService.getUser();
    let check = isAboveMinimumPrivilege(UserPrivileges.MODIFY_ALL);
    return check(me.level);
  }

  createUser(user: UserWithoutPassword) {
    console.log('createUser(', user, ')')
    return this.dataService.createUser(user)
    .then(res => this.loadUsers())
    .catch(err => {
      console.log(err);
    });
  }

  onSubmit() {
    let formValue = this.form.value;
    formValue.level = this.selectedLevel;
    return this.createUser(formValue);
  }

  bulkRegisterFileEvent(fileInputEvent: any) {
    let fileInput = fileInputEvent.srcElement;
    let file = fileInput.files[0];
    let reader = new FileReader();
    reader.onload = (event: ProgressEvent) => {
      console.log('FileUpload onload', event);
      let reader = <FileReader> event.target;
      if (reader.error) {
        console.error('error reading file!');
        return;
      }
      let textContent = reader.result;
      let bulkData = Papa.parse(textContent, {
        header: true
      });
      this.bulkUsers = [];
      console.log(bulkData)
      bulkData.data.forEach(row => {
        this.bulkUsers.push({
          username: row.Username,
          name: row.Name,
          email: row.Email,
          phone: row.Phone,
          role: row.Role,
          level: UserPrivileges.VIEW_ONLY
        })
      })
    }

    reader.readAsText(file);
  }

  usernameExists(username: string) {
    return !!this.users.filter(user => user.username === username).length;
  }
}
