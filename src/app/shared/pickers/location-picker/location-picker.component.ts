import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import {
  ModalController,
  ActionSheetController,
  AlertController,
} from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

import { Capacitor, Plugins } from '@capacitor/core';

import { MapModalComponent } from '../../map-modal/map-modal.component';
import { environment } from '../../../../environments/environment';
import { PlaceLocation, Coordinates } from '../../../places/location.model';

@Component({
  selector: 'app-location-picker',
  templateUrl: './location-picker.component.html',
  styleUrls: ['./location-picker.component.scss'],
})
export class LocationPickerComponent implements OnInit {
  @Output() locationPick = new EventEmitter<PlaceLocation>();
  selectedLocationImage: string;
  isLoading = false;

  constructor(
    private modalCtrl: ModalController,
    private http: HttpClient,
    private actionSheetCtrl: ActionSheetController,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {}

  onPickLocation() {
    this.actionSheetCtrl
      .create({
        header: 'Scegli',
        buttons: [
          { text: 'Auto localizzazione', handler: () => this.locateUser() },
          { text: 'Scegli dalla mappa', handler: () => this.openMap() },
          { text: 'Annulla', role: 'cancel' },
        ],
      })
      .then((actionsEl) => {
        actionsEl.present();
      });
  }

  private locateUser() {
    if (!Capacitor.isPluginAvailable('Geolocation')) {
      this.alertCtrl.create({
        header: 'Impossibile reperire la tua posizione',
        message: 'Utilizza la mappa per scegliere la posizione',
      });
      this.ShowErrorAlert();
      this.isLoading = false;
      return;
    }
    this.isLoading = true;
    Plugins.Geolocation.getCurrentPosition()
      .then((geoPosition) => {
        const coordinates: Coordinates = {
          lat: geoPosition.coords.latitude,
          lng: geoPosition.coords.longitude,
        };
        this.createPlace(coordinates.lat, coordinates.lng);
        this.isLoading = false;
      })
      .catch((err) => {
        this.ShowErrorAlert();
        this.isLoading = false;
      });
  }

  private ShowErrorAlert() {
    this.alertCtrl
      .create({
        header: 'Impossibile reperire la tua posizione',
        message: 'Utilizza la mappa per scegliere la posizione',
        buttons: ['Okay']
      })
      .then((alertEl) => {
        alertEl.present();
      });
  }

  private createPlace(lat: number, lng: number) {
    const pickedLoacation: PlaceLocation = {
      lat,
      lng,
      address: null,
      staticMapImageUrl: null,
    };
    this.isLoading = true;
    this.getAddress(lat, lng)
      .pipe(
        switchMap((address) => {
          pickedLoacation.address = address;
          return of(
            this.getMapImage(pickedLoacation.lat, pickedLoacation.lng, 14)
          );
        })
      )
      .subscribe((staticMapImage) => {
        pickedLoacation.staticMapImageUrl = staticMapImage;
        this.selectedLocationImage = staticMapImage;
        this.isLoading = false;
        this.locationPick.emit(pickedLoacation);
      });
  }

  private openMap() {
    this.modalCtrl.create({ component: MapModalComponent }).then((modalEl) => {
      modalEl.present();
      modalEl.onDidDismiss().then((modalData) => {
        if (!modalData.data) {
          return;
        }
        const coordinates: Coordinates = {
          lat: modalData.data.lat,
          lng: modalData.data.lng,
        };
        this.createPlace(coordinates.lat, coordinates.lng);
      });
    });
  }

  private getAddress(lat: number, lng: number) {
    return this.http
      .get<any>(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${environment.googleMapsAPIKey}`
      )
      .pipe(
        map((geoData) => {
          if (!geoData || !geoData.results || geoData.results.length <= 0) {
            return null;
          }
          return geoData.results[0].formatted_address;
        })
      );
  }

  private getMapImage(lat: number, lng: number, zoom: number) {
    return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=600x300&maptype=roadmap
    &markers=color:red%7Clabel:C%7C${lat},${lng}
    &key=${environment.googleMapsAPIKey}`;
  }
}
