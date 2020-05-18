import { Component, OnInit, OnDestroy } from '@angular/core';
import { SegmentChangeEventDetail } from '@ionic/core';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { MenuController } from '@ionic/angular';

import { PlacesService } from '../places.service';
import { Place } from '../place.model';
import { AuthService } from '../../../app/auth/auth.service';

@Component({
  selector: 'app-discover',
  templateUrl: './discover.page.html',
  styleUrls: ['./discover.page.scss'],
})
export class DiscoverPage implements OnInit, OnDestroy {
  loadedPlaces: Place[];
  listedLoadedPlaces: Place[];
  relevantPlaces: Place[];
  isLoading = false;
  private placesSub: Subscription;
  private filter = 'all';

  constructor(
    private placesService: PlacesService,
    private menuCtrl: MenuController,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.placesSub = this.placesService.places.subscribe((places) => {
      this.loadedPlaces = places;
      this.onFilterUpdate(this.filter);
    });
  }

  ionViewWillEnter() {
    this.isLoading = true;
    this.placesService.fetchPlaces().subscribe(() => {
      this.isLoading = false;
    });
  }

  onOpenMenu() {
    this.menuCtrl.toggle();
  }

  onFilterUpdate(filter: string) {
    this.authService.userId.pipe(take(1)).subscribe((userId) => {
      const isShown = (place: Place) =>
        filter === 'all' || place.userId !== userId;
      this.relevantPlaces = this.loadedPlaces.filter(isShown);
      this.listedLoadedPlaces = this.relevantPlaces.slice(1);
      this.filter = filter;
    });
  }

  ngOnDestroy(): void {
    if (this.placesSub) {
      this.placesSub.unsubscribe();
    }
  }
}
