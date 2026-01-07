import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-shop',
  standalone: true,
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.css']
})
export class ShopComponent implements OnInit {
  ngOnInit(): void {
    window.location.href = 'http://www.goldhaircare.sk/affiliate/2208';
  }
}
