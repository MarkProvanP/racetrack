import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";

import { DataService }         from '../data.service';

@Component({
  selector: "texts",
  templateUrl: "./texts.component.html",
  styleUrls: ["./texts.component.scss"]
})
export class TextsComponent implements OnInit {
  texts: [any] = [];

  constructor(
    private dataService: DataService,
    private router: Router) {}

  getTexts(): void {
    this.dataService.getTexts()
      .then(texts => this.texts = texts);
  }

  onTextReceived(text) {
    this.texts.push(text);
  }

  ngOnInit(): void {
    this.getTexts();
    this.dataService.onTextReceived(text => this.onTextReceived(text));
  }
}
