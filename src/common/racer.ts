import { PhoneNumber, ContactNumber } from './text';

export type RacerId = string;

export class Racer {
  id: RacerId;
  name: string;
  phones: ContactNumber[] = [];
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

  constructor(id: RacerId, properties) {
    this.id = id;
    this.name = properties.name;
    this.email = properties.email;
    if (properties.phones) {
      this.phones = properties.phones.map(contactNumber => ContactNumber.fromJSON(contactNumber));
    }
  }

  getPrimaryContactNumber() {
    if (!this.phones) return;
    let primary = this.phones.filter(contact => contact.preferred);
    if (!primary) {
      return null;
    } else {
      return primary[0];
    }
  }

  hasPhoneNumber(phoneNumber: PhoneNumber | string): boolean {
    if (!this.phones) return false;
    return this.phones.filter(contact => {
      if (contact.number) {
        return contact.number.equals(phoneNumber);
      }
    }).length > 0;
  }
}
