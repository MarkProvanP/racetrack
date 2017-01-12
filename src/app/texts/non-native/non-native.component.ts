import { Component } from "@angular/core";

import { TextService } from "../../text.service";
import { PhoneNumber } from "../../../common/text";

import { MdSnackBar, MdSnackBarConfig } from "@angular/material";
const DEFAULT_SNACKBAR_CONFIG = new MdSnackBarConfig();
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
    timestamp: undefined
  }
  constructor(
    private textService: TextService,
    private snackBar: MdSnackBar
  ) {}

  createNonNativeText() {
    this.textService.createNonNativeText(this.newText)
    .then(success => {
      this.snackBar.open('Created non-native text', undefined, DEFAULT_SNACKBAR_CONFIG)
      this.newText = {
        to: new PhoneNumber(undefined, undefined),
        from: new PhoneNumber(undefined, undefined),
        body: undefined,
        timestamp: undefined
      }
    })
  }
}
