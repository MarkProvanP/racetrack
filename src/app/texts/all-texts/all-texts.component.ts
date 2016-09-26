import { Component, Input } from "@angular/core";
import { Router } from "@angular/router";

import { Racer } from "../../../common/racer";
import { Team } from "../../../common/team";
import { Text } from '../../../common/text';
import { DataService } from '../../data.service';

import * as moment from "moment";

@Component({
  selector: "all-texts",
  templateUrl: "./all-texts.template.html",
  styleUrls: ["./all-texts.styles.scss"]
})
export class AllTextsComponent {
  @Input() texts: [Text];
}
