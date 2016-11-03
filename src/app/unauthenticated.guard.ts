import { Injectable } from "@angular/core";

import { Router, CanActivate } from "@angular/router";

import { UserService } from './user.service';
import { Observable } from "rxjs/Observable";

@Injectable()
export class UnauthenticatedGuard implements CanActivate {
  constructor(private router: Router, private userService: UserService) {}

  canActivate(): Observable<boolean> | boolean {
    console.log('unauthenticatedGuard canActivate');
    return this.userService.auth()
      .map(authenticated => {
        console.log('authenticated?', authenticated);
        if (!authenticated) {
          return true;
        } else {
          this.router.navigate(['/safetyteam']);
          return false;
        }
      }).catch(error => {
        return Observable.of(true);
      })
  }
}
