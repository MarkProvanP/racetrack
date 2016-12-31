import { Injectable } from "@angular/core";

import { Router, CanActivate } from "@angular/router";

import { UserService } from '../user.service';
import { Observable } from "rxjs/Observable";

@Injectable()
export class PasswordResetGuard implements CanActivate {
  constructor(
    private router: Router,
    private userService: UserService
  ) {}

  canActivate(): Observable<boolean> {
    return this.userService.auth()
      .map(authenticated => {
        if (authenticated.resetPassword) {
          this.router.navigate(['/set-password']);
          return false;
        } else {
          return true;
        }
      }).catch(error => {
        return Observable.of(true);
      })
  }
}
