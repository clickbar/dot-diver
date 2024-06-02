// Define types with cyclic dependencies
import type { Path } from '../src/index';


type Person = {
  name: string;
  age: number;
  house: House;
  cars: Car[];
  friends: Person[];
};

type House = {
  address: string;
  owner: Person;
  residents: Person[];
  garage: Garage;
};

type Car = {
  make: string;
  model: string;
  year: number;
  owner: Person;
};

type Garage = {
  capacity: number;
  cars: Car[];
  house: House;
};

type Company = {
  name: string;
  employees: Person[];
  ceo: Person;
  headquarters: Building;
};

type Building = {
  address: string;
  occupants: Company[];
};

type SimpleTest = {
  a: SimpleTest2;
}

type SimpleTest2 = {
  b: SimpleTest;
}

export type Paths = Path<Person, never, { depth: 13, onlyWriteable: true }>
//export type value = PathValue<Person, 'house.garage.cars.0.owner.house.garage.cars.0.owner.house.garage.cars.0.owner'> // 'number'
