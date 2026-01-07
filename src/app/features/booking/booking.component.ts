import { Component } from '@angular/core';

@Component({
  selector: 'app-booking',
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.css']
})
export class BookingComponent {
  constructor() {
    window.location.href = 'https://services.bookio.com/papi-hair-design/widget?lang=sk';
  }
}
