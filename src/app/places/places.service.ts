import { Injectable } from '@angular/core';
import { Place } from './place.model';

@Injectable({
  providedIn: 'root',
})
export class PlacesService {
  // tslint:disable-next-line: variable-name
  private _places: Place[] = [
    new Place(
      'p1',
      'Castello di Lagopesole',
      'Il castello medioevale dei tuoi sogni',
      'https://upload.wikimedia.org/wikipedia/commons/f/fc/CastelloLagopesole.jpg',
      149.99,
      new Date('2020-01-01'),
      new Date('2020-12-31')
    ),
    new Place(
      'p2',
      'Hotel Castello',
      'Rivivi le esperienze del passato a Modena',
      'https://q-cf.bstatic.com/images/hotel/max1280x900/668/6685679.jpg',
      189.99,
      new Date('2020-01-01'),
      new Date('2020-12-31')
    ),
    new Place(
      'p3',
      'Hotel Dei Giardini',
      'Hotel romantico, dove passare delle notti indimenticabili',
      'https://hoteldeigiardini.com/wp-content/uploads/2018/08/SLIDE_piscina5.jpg',
      99.99,
      new Date('2020-01-01'),
      new Date('2020-12-31')
    ),
  ];
  constructor() {}

  get Places() {
    return [...this._places];
  }

  getPlace(placeId: string) {
    return { ...this._places.find((p) => p.id === placeId) };
  }
}
