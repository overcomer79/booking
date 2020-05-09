import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { take, map, tap, delay } from 'rxjs/operators';

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
      'xyz'
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
    return this.places.pipe(
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

    return this.places.pipe(
      take(1),
      delay(1000),
      tap((places) => {
        this._places.next(places.concat(newPlace));
      })
    );
  }

  updatePlace(placeId: string, title: string, description: string) {
    return this.places.pipe(
      take(1),
      delay(1000),
      tap((places) => {
        const updatedPlaceIndex = places.findIndex((pl) => pl.id === placeId);
        const updatePlaces = [...places];
        const oldPlace = updatePlaces[updatedPlaceIndex];
        updatePlaces[updatedPlaceIndex] = new Place(
          oldPlace.id,
          title,
          description,
          oldPlace.imageUrl,
          oldPlace.price,
          oldPlace.availableFrom,
          oldPlace.availableTo,
          this.authService.userId
        );
        this._places.next(updatePlaces);
      })
    );
  }
}
