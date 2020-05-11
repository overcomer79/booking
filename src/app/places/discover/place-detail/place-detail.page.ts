import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  NavController,
  ModalController,
  ActionSheetController,
  LoadingController,
} from '@ionic/angular';

import { PlacesService } from '../../places.service';
import { Place } from '../../place.model';
import { CreateBookingComponent } from '../../../bookings/create-booking/create-booking.component';
import { BookingService } from '../../../bookings/booking.service';

@Component({
  selector: 'app-place-detail',
  templateUrl: './place-detail.page.html',
  styleUrls: ['./place-detail.page.scss'],
})
export class PlaceDetailPage implements OnInit, OnDestroy {
  place: Place;
  private placesSub: Subscription;

  constructor(
    private navCtrl: NavController,
    private route: ActivatedRoute,
    private placesService: PlacesService,
    private modalCtrl: ModalController,
    private actionSheetCtrl: ActionSheetController,
    private bookingService: BookingService,
    private loadingCtrl: LoadingController
  ) {}

  ngOnInit() {
    this.placesSub = this.route.paramMap.subscribe((paramMap) => {
      if (!paramMap.has('placeId')) {
        this.navCtrl.navigateBack('/places/tabs/discover');
        return;
      }
      this.placesService
        .getPlace(paramMap.get('placeId'))
        .subscribe((place) => (this.place = place));
    });
  }

  onBookPlace() {
    this.actionSheetCtrl
      .create({
        header: 'Choose an Actions',
        buttons: [
          {
            text: 'Select Date',
            handler: () => {
              this.openBookingModal('select');
            },
          },
          {
            text: 'Random date',
            handler: () => {
              this.openBookingModal('random');
            },
          },
          {
            text: 'Cancel',
            role: 'cancel',
          },
        ],
      })
      .then((actionEl) => {
        actionEl.present();
      });
  }

  openBookingModal(mode: 'select' | 'random') {
    this.modalCtrl
      .create({
        component: CreateBookingComponent,
        componentProps: { selectedPlace: this.place, selectedMode: mode },
      })
      .then((modalEl) => {
        modalEl.present();
        return modalEl.onDidDismiss();
      })
      .then((resultData) => {
        console.log(resultData.data, resultData.role);
        if (resultData.role === 'confirm') {
          this.loadingCtrl
            .create({ message: 'Sto prenotando...' })
            .then((loadingEl) => {
              loadingEl.present();
              const data = resultData.data.bookingData;

              this.bookingService
                .addBooking(
                  this.place.id,
                  this.place.title,
                  this.place.imageUrl,
                  data.firstName,
                  data.lastName,
                  data.guestNumber,
                  data.startDate,
                  data.endDate
                )
                .subscribe(() => {
                  loadingEl.dismiss();
                });
            });
        }
      });
  }

  ngOnDestroy(): void {
    if (this.placesSub) {
      this.placesSub.unsubscribe();
    }
  }
}
