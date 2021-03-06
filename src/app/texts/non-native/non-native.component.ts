import { Component } from "@angular/core";

import { TextService } from "../../text.service";
import { UserService } from "../../user.service";
import { PhoneNumber } from "../../../common/text";

import { MatSnackBar, MatSnackBarConfig } from "@angular/material";
const DEFAULT_SNACKBAR_CONFIG = new MatSnackBarConfig();
DEFAULT_SNACKBAR_CONFIG.duration = 5000;

@Component({
  selector: 'add-non-native-text',
  templateUrl: './non-native.component.pug',
  styleUrls: ['./non-native.component.scss']
})
export class AddNonNativeTextComponent {
  newText = {
    to: new PhoneNumber(undefined, undefined),
    from: new PhoneNumber(undefined, undefined),
    body: undefined,
    timestamp: undefined,
    addedBy: undefined,
    outgoing: false
  }
  constructor(
    private textService: TextService,
    private userService: UserService,
    private snackBar: MatSnackBar
  ) {}

  createNonNativeText() {
    this.textService.createNonNativeText(this.newText)
    .then(success => {
      this.snackBar.open('Created non-native text', undefined, DEFAULT_SNACKBAR_CONFIG)
      this.newText = {
        to: new PhoneNumber(undefined, undefined),
        from: new PhoneNumber(undefined, undefined),
        body: undefined,
        timestamp: undefined,
        addedBy: this.userService.getUserAction(),
        outgoing: false
      }
    })
  }

  getTextDirection() {
    return this.newText.outgoing ? "Safety Team to Racer" : "Racer to Safety Team"
  }

  toggleDirection() {
    this.newText.outgoing = !this.newText.outgoing;
  }
}
