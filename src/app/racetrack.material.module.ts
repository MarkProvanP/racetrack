import {MatButtonModule, MatCheckboxModule} from '@angular/material';

import { NgModule, ApplicationRef } from '@angular/core';

@NgModule({
  imports: [
    MatButtonModule,
    MatCheckboxModule
  ],
  exports: [
    MatButtonModule,
    MatCheckboxModule
  ]
})
export class RacetrackMaterialModule {

}
