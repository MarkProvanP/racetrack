import { Injectable } from "@angular/core";

import { Router, CanActivate } from "@angular/router";

import { UserService } from './user.service';
import { Observable } from "rxjs/Observable";

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  constructor(private router: Router, private userService: UserService) {}

  canActivate(): Observable<boolean> {
    return this.userService.authenticatedCheck()
      .map(authenticated => {
        if (authenticated) {
          return true;
        } else {
          this.router.navigate(['/']);
          return false;
        }
      }).catch(error => {
        return Observable.of(false);
      })
  }
}
