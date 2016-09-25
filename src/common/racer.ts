import { PhoneNumber } from './text';

export type RacerId = string;

export class Racer {
  id: RacerId;
  name: string;
  nationality: string;
  phone: PhoneNumber;

  static fromJSON(obj) {
    return new Racer(obj.id, obj);
  }

  toIdJSON() {
    return JSON.stringify(this);
  }

  constructor(id: RacerId, properties) {
    this.id = id;
    this.name = properties.name;
    this.nationality = properties.nationality;
    this.phone = properties.phone;
  }
}
