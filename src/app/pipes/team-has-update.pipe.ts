import { Pipe, PipeTransform } from "@angular/core";

import { Team } from "../../common/team";

@Pipe({
  name: 'teamHasUpdate',
  pure: true
})
export class TeamHasUpdatePipe implements PipeTransform {
  transform(input: Team[]) {
    return input.filter(team => team.getLastUpdate())
  }
}
