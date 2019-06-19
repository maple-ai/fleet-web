import { Component } from '@angular/core'

@Component({
  selector: 'not-found',
  	template:`<h4 class="text-sm-center" style="margin-top: 100px;">Page Not Found</h4>

  <p class="text-sm-center"><a [routerLink]="['/']">Maple Fleet Home Page</a></p>`,
})

export class NotFoundComponent { }
