import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, of } from 'rxjs';
import { take, map, tap, delay, switchMap } from 'rxjs/operators';

import { Place } from './place.model';
import { AuthService } from '../auth/auth.service';
import { PlaceLocation } from './location.model';

interface PlaceResponse {
  availableFrom: string;
  availableTo: string;
  description: string;
  imageUrl: string;
  price: number;
  title: string;
  userId: string;
  location: PlaceLocation;
}

@Injectable({
  providedIn: 'root',
})
export class PlacesService {
  // tslint:disable-next-line: variable-name
  private _places = new BehaviorSubject<Place[]>([
    // new Place(
    //   'p1',
    //   'Castello di Lagopesole',
    //   'Il castello medioevale dei tuoi sogni',
    //   'https://upload.wikimedia.org/wikipedia/commons/f/fc/CastelloLagopesole.jpg',
    //   149.99,
    //   new Date('2020-01-01'),
    //   new Date('2020-12-31'),
    //   'xyz'
    // ),
    // new Place(
    //   'p2',
    //   'Hotel Castello',
    //   'Rivivi le esperienze del passato a Modena',
    //   'https://q-cf.bstatic.com/images/hotel/max1280x900/668/6685679.jpg',
    //   189.99,
    //   new Date('2020-01-01'),
    //   new Date('2020-12-31'),
    //   'abc'
    // ),
    // new Place(
    //   'p3',
    //   'Hotel Dei Giardini',
    //   'Hotel romantico, dove passare delle notti indimenticabili',
    //   'https://hoteldeigiardini.com/wp-content/uploads/2018/08/SLIDE_piscina5.jpg',
    //   99.99,
    //   new Date('2020-01-01'),
    //   new Date('2020-12-31'),
    //   'abc'
    // ),
  ]);
  constructor(private authService: AuthService, private http: HttpClient) {}

  get places() {
    return this._places.asObservable();
  }

  getPlace(placeId: string) {
    return this.http
      .get<PlaceResponse>(
        `https://ionic-booking-e5760.firebaseio.com/offered-places/${placeId}.json`
      )
      .pipe(
        map((respData) => {
          return new Place(
            placeId,
            respData.title,
            respData.description,
            respData.imageUrl,
            respData.price,
            new Date(respData.availableFrom),
            new Date(respData.availableTo),
            respData.userId,
            respData.location
          );
        })
      );
  }

  fetchPlaces() {
    return this.http
      .get<{ [key: string]: PlaceResponse }>(
        'https://ionic-booking-e5760.firebaseio.com/offered-places.json'
      )
      .pipe(
        map((resData) => {
          const places: Place[] = [];
          for (const key in resData) {
            if (resData.hasOwnProperty(key)) {
              places.push(
                new Place(
                  key,
                  resData[key].title,
                  resData[key].description,
                  resData[key].imageUrl,
                  resData[key].price,
                  new Date(resData[key].availableFrom),
                  new Date(resData[key].availableTo),
                  resData[key].userId,
                  resData[key].location
                )
              );
            }
          }
          return places;
        }),
        tap((places) => {
          this._places.next(places);
        })
      );
  }

  uploadImage(image: File) {
    const uploadData = new FormData();
    uploadData.append('image', image);

    return this.http.post<{ imageUrl: string; imagePath: string }>(
      'https://us-central1-ionic-booking-e5760.cloudfunctions.net/storeImage',
      uploadData
    );
  }

  addPlace(
    title: string,
    description: string,
    price: number,
    dateFrom: Date,
    dateTo: Date,
    location: PlaceLocation,
    imageUrl: string
  ) {
    let generatedId: string;
    const newPlace = new Place(
      Math.random().toString(),
      title,
      description,
      imageUrl,
      price,
      dateFrom,
      dateTo,
      this.authService.userId,
      location
    );
    return this.http
      .post<{ name: string }>(
        'https://ionic-booking-e5760.firebaseio.com/offered-places.json',
        {
          ...newPlace,
          id: null,
        }
      )
      .pipe(
        switchMap((resData) => {
          generatedId = resData.name;
          return this.places;
        }),
        take(1),
        tap((places) => {
          newPlace.id = generatedId;
          this._places.next(places.concat(newPlace));
        })
      );
  }

  updatePlace(placeId: string, title: string, description: string) {
    let updatedPlaces: Place[];

    return this.places.pipe(
      take(1),
      switchMap((places) => {
        if (!places || places.length <= 0) {
          return this.fetchPlaces();
        } else {
          return of(places);
        }
      }),
      switchMap((places) => {
        const updatedPlaceIndex = places.findIndex((pl) => pl.id === placeId);
        updatedPlaces = [...places];
        const oldPlace = updatedPlaces[updatedPlaceIndex];
        updatedPlaces[updatedPlaceIndex] = new Place(
          oldPlace.id,
          title,
          description,
          oldPlace.imageUrl,
          oldPlace.price,
          oldPlace.availableFrom,
          oldPlace.availableTo,
          this.authService.userId,
          oldPlace.location
        );
        return this.http.put(
          `https://ionic-booking-e5760.firebaseio.com/offered-places/${placeId}.json`,
          { ...updatedPlaces[updatedPlaceIndex], id: null }
        );
      }),
      tap(() => {
        this._places.next(updatedPlaces);
      })
    );
  }
}
