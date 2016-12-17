import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { FormGroup, FormControl, Validators } from "@angular/forms";

import { UserWithoutPassword } from '../../../common/user';
import { UserService } from "../../user.service";

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

  constructor(
    private userService: UserService,
    private router: Router
  ) {
    this.loadUsers();
  }

  loadUsers() {
    this.userService.listAllUsers()
    .then(users => this.users = users);

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

  onSubmit() {
    this.userService.register(this.form.value)
    .then(res => this.loadUsers())
    .catch(err => {
      console.log(err);
    });
  }
}
