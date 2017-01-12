import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";

@Component({
  selector: "texts",
  templateUrl: "./texts.component.pug",
  styleUrls: ["./texts.component.scss"]
})
export class TextsComponent implements OnInit {
  tabs = [
    {link: 'all', label: 'All'},
    {link: 'by-team', label: 'By Team'},
    {link: 'by-racer', label: 'By Racer'},
    {link: 'non-native', label: 'Add from elsewhere'}
  ]
  activeLinkIndex = 0;

  constructor(
    private router: Router
  ) {}

  ngOnInit() {
    // Horrible hack time!
    let selectionFromRoute = this.router.url.split("/")[3];
    for (let i = 0; i < this.tabs.length; i++) {
      let option = this.tabs[i];
      if (option.link == selectionFromRoute) {
        this.activeLinkIndex = i;
        return;
      }
    }
  }
}
