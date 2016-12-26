/*
 * Implementation from http://www.fueltravel.com/blog/migrating-from-angular-1-to-2-part-1-pipes/
 */
import { Pipe, PipeTransform } from "@angular/core";
import * as moment from "moment";

@Pipe({
  name: 'orderBy',
  pure: false
})
export class OrderByPipe implements PipeTransform {
  static _orderByComparator(a: any, b: any): number {
    let momentA = moment(a);
    let momentB = moment(b);
    let compareAsDates = momentA.isValid() && momentB.isValid();
    if (compareAsDates && a && b) {
      let diff = momentA.diff(momentB);
      if (diff < 0) { return -1 }
      if (diff > 0) { return 1 }
      return 0;
    }
    let compareAsStrings = (isNaN(parseFloat(a)) || !isFinite(a))
      || (isNaN(parseFloat(b)) || !isFinite(b));
    if (compareAsStrings && a && b) {
      if (a.toLowerCase() < b.toLowerCase()) return -1;
      if (a.toLowerCase() > b.toLowerCase()) return 1;
    } else {
      if (parseFloat(a) < parseFloat(b)) return -1;
      if (parseFloat(a) > parseFloat(b)) return 1;
    }
    return 0;
  }

  transform(input: any, [config = '+']): any {
    if (!Array.isArray(input)) return input;

    input = input.slice(0);

    if (!Array.isArray(config) || (Array.isArray(config) && config.length == 1)) {
      let propertyToCheck: string = !Array.isArray(config) ? config : config[0];
      let desc = propertyToCheck.substr(0, 1) == '-';

      if (!propertyToCheck || propertyToCheck == '-' || propertyToCheck == '+') {
        return !desc ? input.sort() : input.sort().reverse();
      } else {
        let propertyNotSplit: string = propertyToCheck.substr(0, 1) == '+' || propertyToCheck.substr(0, 1) == '-'
          ? propertyToCheck.substr(1)
          : propertyToCheck;
        let propertyArray = propertyNotSplit.split(".");
        return input.sort((a, b) => {
          let aValue = a[propertyArray[0]];
          for (let i = 1; i < propertyArray.length; i++) {
            aValue = aValue[propertyArray[i]];
          }
          let bValue = b[propertyArray[0]];
          for (let i = 1; i < propertyArray.length; i++) {
            bValue = bValue[propertyArray[i]];
          }
          let compare = OrderByPipe._orderByComparator(aValue, bValue)
          return !desc ? compare : -compare
        });
      }
    } else {
      return input.sort((a, b) => {
        for (let i = 0; i < config.length; i++) {
          let desc = config[i].substr(0, 1) == '-';
          let property = config[i].substr(0, 1) == '+' || config[i].substr(0, 1) == '-'
            ? config[i].substr(1)
            : config[i];
          let comparison  = !desc
            ? OrderByPipe._orderByComparator(a[property], b[property])
            : -OrderByPipe._orderByComparator(a[property], b[property]);
          if (comparison != 0) return comparison;
        }

        return 0;
      })
    }
  }
}
