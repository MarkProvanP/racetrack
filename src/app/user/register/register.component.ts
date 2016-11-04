import { Component, OnInit } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { Router } from "@angular/router";

import { UserService } from '../../user.service';

@Component({
  selector: 'register',
  styleUrls: ['./register.style.scss'],
  templateUrl: './register.template.html'
})
export class RegisterComponent implements OnInit {
  username: FormControl;
  password: FormControl;
  name: FormControl;
  email: FormControl;
  phone: FormControl;
  form: FormGroup;

  constructor(private userService: UserService, private router: Router) {

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
      .then(data => {
        this.router.navigate(['/']);
      })
      .catch(err => {
        console.log(err);
      });
  }
}
