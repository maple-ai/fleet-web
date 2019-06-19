import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { APIService } from '../providers/api.service';

@Component({
  selector: 'help-menu',
  	templateUrl: './help.pug',

})
export class HelpComponent {
  constructor(private api: APIService, private router: Router) { }
}