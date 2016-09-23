import { InMemoryDbService } from 'angular2-in-memory-web-api';
export class InMemoryDataService implements InMemoryDbService {
  createDb() {
    let racers = [
      {id: 100, name: 'Tom Smith', nationality: 'GB', phone: '+12134732'},
      {id: 101, name: 'Dick Stanley', nationality: 'GB', phone: '+1912912'},
      {id: 102, name: 'Harry Monaghan', nationality: 'US', phone: '+121240342'},
      {id: 103, name: 'Sally Garrard', nationality: 'CA', phone: '+12554654'},
      {id: 104, name: 'Jess Swanwick', nationality: 'FR', phone: '+121239123'},
      {id: 105, name: 'Veronica Thomson', nationality: 'DE', phone: '+1289238942'}
    ];
    let teams = [
      {id: 11, name: 'H2G2', racers: [
        racers[0], racers[2], racers[4] 
      ]},
      {id: 12, name: 'Prague or Bust', racers: [
        racers[1], racers[3], racers[5]
      ]}
    ];
    return {teams, racers};
  }
}


/*
Copyright 2016 Google Inc. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at http://angular.io/license
*/
