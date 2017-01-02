import { PhoneNumber, ContactNumber } from './text';

export type RacerId = string;

export interface DbFormRacer {
  id: RacerId;
  name: string;
  phones: ContactNumber[]
  email: string;
}

export class Racer {
  id: RacerId;
  name: string;
  phones: ContactNumber[];
  email: string;

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
    this.email = properties.email;
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

  hasPhoneNumber(phoneNumber: PhoneNumber | string): boolean {
    return this.phones.filter(contact => {
      if (contact.number) {
        return contact.number.equals(phoneNumber);
      }
    }).length > 0;
  }

  toDbForm() {
    return JSON.parse(JSON.stringify(this));
  }
}
