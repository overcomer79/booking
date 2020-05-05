import { Injectable } from '@angular/core';
import { Booking } from './booking.model';

@Injectable({ providedIn: 'root' })
export class BookingService {
    // tslint:disable-next-line: variable-name
    private _bookings: Booking[] = [
        {
             id: 'xyz',
             placeId: 'p1',
             placeTitle: 'Castello di Lagopesole',
             guestNumber: 3,
             userId: 'abc'
        }
    ];

    get bookings() {
        return [...this._bookings];
    }
}
