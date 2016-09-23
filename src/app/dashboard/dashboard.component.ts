import { Component } from '@angular/core';

import { DataService } from '../data.service';

@Component({
  selector: 'dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  constructor(private dataService: DataService) {
  }

  
}
