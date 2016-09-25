export type RacerId = number;

export class Racer {
  id: RacerId;
  name: string;
  nationality: string;
  phone: string;

  constructor(id: RacerId, properties) {
    this.id = id;
    this.name = properties.name;
    this.nationality = properties.nationality;
    this.phone = properties.phone;
  }
}
