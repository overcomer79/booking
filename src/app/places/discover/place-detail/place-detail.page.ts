import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  NavController,
  ModalController,
  ActionSheetController,
  LoadingController,
  AlertController,
} from '@ionic/angular';
import { switchMap, take } from 'rxjs/operators';

import { PlacesService } from '../../places.service';
import { Place } from '../../place.model';
import { CreateBookingComponent } from '../../../bookings/create-booking/create-booking.component';
import { BookingService } from '../../../bookings/booking.service';
import { AuthService } from '../../../auth/auth.service';
import { MapModalComponent } from '../../../shared/map-modal/map-modal.component';

@Component({
  selector: 'app-place-detail',
  templateUrl: './place-detail.page.html',
  styleUrls: ['./place-detail.page.scss'],
})
export class PlaceDetailPage implements OnInit, OnDestroy {
  place: Place;
  isBookable = false;
  isLoading = false;
  private placesSub: Subscription;

  constructor(
    private navCtrl: NavController,
    private route: ActivatedRoute,
    private placesService: PlacesService,
    private modalCtrl: ModalController,
    private actionSheetCtrl: ActionSheetController,
    private bookingService: BookingService,
    private loadingCtrl: LoadingController,
    private authService: AuthService,
    private alertCtrl: AlertController,
    private router: Router
  ) {}

  ngOnInit() {
    this.placesSub = this.route.paramMap.subscribe((paramMap) => {
      if (!paramMap.has('placeId')) {
        this.navCtrl.navigateBack('/places/tabs/discover');
        return;
      }
      this.isLoading = true;
      let fetchedUserId: string;
      this.authService.userId.pipe(take(1), switchMap(userId => {
        if (!userId) {
          throw new Error('Not user found');
        }
        fetchedUserId = userId;
        return this.placesService.getPlace(paramMap.get('placeId'));
      })).subscribe(
        (place) => {
          this.place = place;
          this.isBookable = place.userId !== fetchedUserId;
          this.isLoading = false;
        },
        (error) => {
          this.alertCtrl
            .create({
              header: 'Errore imprevisto',
              message:
                'Non sono riuscito a recuperare i dati richiesti. Per favore riprova più tardi',
              buttons: [
                {
                  text: 'Okay',
                  handler: () => {
                    this.router.navigateByUrl('/places/tabs/discover');
                  },
                },
              ],
            })
            .then((alertEl) => {
              alertEl.present();
            });
        }
      );
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

  onShowFullMap() {
    this.modalCtrl
      .create({
        component: MapModalComponent,
        componentProps: {
          center: {
            lat: this.place.location.lat,
            lng: this.place.location.lng,
          },
          selectable: false,
          closeButtonText: 'Chiudi',
          title: this.place.location.address,
        },
      })
      .then((modalEl) => {
        modalEl.present();
      });
  }

  ngOnDestroy(): void {
    if (this.placesSub) {
      this.placesSub.unsubscribe();
    }
  }
}
