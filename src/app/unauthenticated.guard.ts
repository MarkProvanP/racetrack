import { Injectable } from "@angular/core";

import { Router, CanActivate } from "@angular/router";

import { UserService } from './user.service';
import { Observable } from "rxjs/Observable";

@Injectable()
export class UnauthenticatedGuard implements CanActivate {
  constructor(private router: Router, private userService: UserService) {}

  canActivate(): Observable<boolean> | boolean {
    console.log('unauthenticatedGuard canActivate');
    return this.userService.authenticatedCheck()
      .map(result => {
        console.log('result was');
        if (!result.authenticated) {
          return true;
        } else {
          this.router.navigate(['/']);
          return false;
        }
      }).catch(error => {
        return Observable.of(true);
      })
  }
}