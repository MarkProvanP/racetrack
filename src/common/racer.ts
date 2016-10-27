import { PhoneNumber, ContactNumber } from './text';

export type RacerId = string;

export class Racer {
  id: RacerId;
  name: string;
  nationality: string;
  phones: ContactNumber[] = [];

  makeClone() {
    let copy = JSON.parse(JSON.stringify(this));
    return Racer.fromJSON(copy);
  }

  stripPrivateData(): Racer {
    let stripped = this.makeClone();
    stripped.nationality = undefined;
    stripped.phones = [];
    return stripped;
  }

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
    if (properties.phones) {
      this.phones = properties.phones;
    }
  }

  getPrimaryContactNumber() {
    let primary = this.phones.filter(contact => contact.preferred);
    if (!primary) {
      return null;
    } else {
      return primary[0];
    }
  }
}
