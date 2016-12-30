import { PhoneNumber, ContactNumber } from './text';

export type RacerId = string;

export interface DbFormRacer {
  id: RacerId;
  name: string;
  phones: ContactNumber[]
}

export class Racer {
  id: RacerId;
  name: string;
  phones: ContactNumber[];

  makeClone() {
    let copy = JSON.parse(JSON.stringify(this));
    return Racer.fromJSON(copy);
  }

  stripPrivateData(): Racer {
    let stripped = this.makeClone();
    stripped.phones = [];
    return stripped;
  }

  static fromJSON(obj) {
    if (!obj) {
      throw new Error('Racer fromJSON on invalid object!');
    }
    return new Racer(obj.id, obj);
  }

  toIdJSON() {
    return JSON.stringify(this);
  }

  constructor(id: RacerId, properties) {
    this.id = id;
    this.name = properties.name;
    if (properties.phones) {
      this.phones = properties.phones.map(contactNumber => ContactNumber.fromJSON(contactNumber));
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

  toDbForm() {
    return JSON.parse(JSON.stringify(this));
  }
}
