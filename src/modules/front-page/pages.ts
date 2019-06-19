import { Component } from '@angular/core';
import { Router } from '@angular/router'

import { APIService } from '../providers/api.service'
import { MarketingService } from './marketing.service'

@Component({
	templateUrl: './homepage.pug',
 })
export class HomepageComponent {
  constructor(private marketingService: MarketingService, private router: Router) { }

  openRegister() {
    this.marketingService.openModalCallback('register')
  }

  openWhoAreButton(event: MouseEvent) {
    let h, w;
    // let h = event.srcElement.clientHeight, w = event.srcElement.clientWidth;
    let x = event.offsetX, y = event.offsetY;

    let left = x / w, top = y / h;
    let minTop = 0.27388535031847133, maxTop = 0.9299363057324841;

    if (left > 0.0335 && left < 0.3686 && top > minTop && top < maxTop) {
      // left business
      this.router.navigate(['/for-business']);
      return
    }

    if (left > 0.6292 && left < 0.9643 && top > minTop && top < maxTop) {
      // right drivers
      this.router.navigate(['/drivers']);
    }
  }
}

@Component({
	templateUrl: './drivers.pug',
 })
export class DriversComponent {
  constructor(private marketingService: MarketingService) { }

  openRegister() {
    this.marketingService.openModalCallback('register')
  }
}

@Component({
	templateUrl: './for-business.pug',
 })
export class ForBusinessComponent {
  constructor(private marketingService: MarketingService) { }

  openRegister() {
    this.marketingService.openModalCallback('register')
  }
}

@Component({
	templateUrl: './contact-us.pug',
 })
export class ContactComponent {
  contact = {
    name: "",
    email: "",
    message: ""
  }
  status = ""

  constructor(private api: APIService, private marketingService: MarketingService) { }

  openRegister() {
    this.marketingService.openModalCallback('register')
  }

  send() {
    this.api.post('/contact', this.contact).subscribe(res => {
      this.status = 'Message sent!'
      this.contact.name = ''
      this.contact.email = ''
      this.contact.message = ''
    }, err => {
      this.status = 'Message cannot be sent'
      let data = err.json()
      if (data && data.errors) {
        this.status += ': ' + data.errors.join(', ');
      }
    })
  }
}