import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { take, map } from 'rxjs/operators';

import { Place } from './place.model';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class PlacesService {
  // tslint:disable-next-line: variable-name
  private _places = new BehaviorSubject<Place[]>([
    new Place(
      'p1',
      'Castello di Lagopesole',
      'Il castello medioevale dei tuoi sogni',
      'https://upload.wikimedia.org/wikipedia/commons/f/fc/CastelloLagopesole.jpg',
      149.99,
      new Date('2020-01-01'),
      new Date('2020-12-31'),
      'abc'
    ),
    new Place(
      'p2',
      'Hotel Castello',
      'Rivivi le esperienze del passato a Modena',
      'https://q-cf.bstatic.com/images/hotel/max1280x900/668/6685679.jpg',
      189.99,
      new Date('2020-01-01'),
      new Date('2020-12-31'),
      'abc'
    ),
    new Place(
      'p3',
      'Hotel Dei Giardini',
      'Hotel romantico, dove passare delle notti indimenticabili',
      'https://hoteldeigiardini.com/wp-content/uploads/2018/08/SLIDE_piscina5.jpg',
      99.99,
      new Date('2020-01-01'),
      new Date('2020-12-31'),
      'abc'
    ),
  ]);
  constructor(private authService: AuthService) {}

  get places() {
    return this._places.asObservable();
  }

  getPlace(placeId: string) {
    return this.places
      .pipe(
        take(1),
        map((places) => {
          return { ...places.find((p) => p.id === placeId) };
        })
      );
  }

  addPlace(
    title: string,
    description: string,
    price: number,
    dateFrom: Date,
    dateTo: Date
  ) {
    const newPlace = new Place(
      Math.random().toString(),
      title,
      description,
      'https://q-cf.bstatic.com/images/hotel/max1280x900/668/6685679.jpg',
      price,
      dateFrom,
      dateTo,
      this.authService.userId
    );
    this.places.pipe(take(1)).subscribe((places) => {
      this._places.next(places.concat(newPlace));
    });
  }
}
