export type RacerId = number;

export class Racer {
  id: RacerId;
  name: string;
  nationality: string;
  phone: string;

  constructor(id: RacerId, name: string) {
    this.id = id;
    this.name = name;
  }
}
