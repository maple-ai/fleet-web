import { Component, OnInit, ViewChild } from '@angular/core';
import { Routes, Router } from '@angular/router';
import { ModalDirective } from 'ng2-bootstrap';

import { UserService, User } from '../providers/user.service';
import { APIService } from '../providers/api.service';
import {
  HomepageComponent,
  ForBusinessComponent,
  DriversComponent,
  ContactComponent
} from './pages';
import { PasswordResetComponent } from '../auth/reset';
import { MarketingService } from './marketing.service';

declare var gapi;

@Component({
  templateUrl: 'navigation.pug',
  styleUrls: ['marketing.scss'],
  providers: [MarketingService],
})

export class MarketingRouter implements OnInit {
  @ViewChild('loginModal', {static: true}) public loginModal: ModalDirective;
  @ViewChild('registerModal', {static: true}) public registerModal: ModalDirective;
  @ViewChild('forgotModal', {static: true}) public forgotModal: ModalDirective;

  public navbarCollapsed: boolean = true;
  loggedIn = false;
  user: User = null;
  googleBtnSrc = '../../assets/google_normal.png'

  authDetails = {
    status: "",
    name: "",
    email: "",
    no_unspent_criminal: false,
    password: "",
    phone_number: ""
  }

  constructor(private userService: UserService, private router: Router, private api: APIService, private marketingService: MarketingService) {
    this.loggedIn = userService.isLoggedIn()
    this.router.events.subscribe(event => {
      this.navbarCollapsed = true
    })

    marketingService.openModalCallback = this.openModalCallback.bind(this)
  }

  ngOnInit() {
    this.loggedIn = this.userService.isLoggedIn()

    if (this.loggedIn) {
      this.userService.fetchUser().then(user => {
        this.user = user
      })
    }

    this.router.events.subscribe((path) => {
      window.scrollTo(0, 0);
    });

    window["gapi"] && gapi.load('auth2');
  }

  openModalCallback(type) {
    switch (type) {
      case 'login':
        this.showLoginModal()
        break
      case 'register':
        this.showRegisterModal()
        break
    }
  }

  googleSignin() {
    var auth2 = gapi.auth2.getAuthInstance()
    if (!auth2) {
      auth2 = gapi.auth2.init({
        client_id: '657480039049-igves2k18djqmd1ppnhlv3lmolp20m3d.apps.googleusercontent.com',
        cookiepolicy: 'single_host_origin'
      });
    }

    this.authDetails.status = "Authenticating with Google..."
    auth2.grantOfflineAccess({ redirect_uri: 'postmessage' }).then(authToken => {
      this.authDetails.status = "Verifying Login data"

      this.api.post('/auth/google', authToken).subscribe(res => {
        let data = res.json()
        if (!data || !data.token) {
          return;
        }

        this.api.setToken(data.token);
        this.loginModal.hide()
        this.registerModal.hide()

        this.authDetails.status = "Logged in!"
        this.userService.fetchUser().then(() => {
          if (this.userService.permissions.admin || this.userService.permissions.superadmin) {
            this.router.navigate(['/admin/memberships']);
          } else if (this.userService.permissions.supervisor) {
            this.router.navigate(['/supervisor/users']);
          } else {
            this.router.navigate(['/membership']);
          }
        })
      })
    })
  }

  logout() {
    this.userService.logout()
  }

  login() {
    this.api.post('/auth/password', this.authDetails).subscribe(res => {
      this.api.setToken(res.json().token);
      this.loginModal.hide();

      this.userService.fetchUser().then(() => {
        if (this.userService.permissions.admin || this.userService.permissions.superadmin) {
          this.router.navigate(['/admin/memberships']);
        } else if (this.userService.permissions.supervisor) {
          this.router.navigate(['/supervisor/users']);
        } else {
          this.router.navigate(['/membership']);
        }
      })

      return res;
    }, err => {
      this.authDetails.status = 'Invalid Login';
    });

    this.authDetails.status = ""
    this.authDetails.password = ""
  }

  register() {
    this.authDetails.status = '';

    if (this.authDetails.no_unspent_criminal == false) {
      this.authDetails.status = 'To register as a driver, you must not have unspent criminal convictions';
      return;
    }

    this.api.post('/auth/register', this.authDetails).subscribe(res => {
      this.api.setToken(res.json().token);
      this.registerModal.hide();
      this.router.navigate(['/membership']);

      return res;
    }, err => {
      let body = err.json()
      if (body.errors) {
        this.authDetails.status = 'Error: ' + body.errors.join(', ');
      } else {
        this.authDetails.status = 'Cannot Sign up';
      }
    });

    this.authDetails.status = ""
  }

  forgot() {
    this.api.post('/auth/forgot', this.authDetails).subscribe(res => {
      this.authDetails.status = 'Password reset instructions sent'
    }, err => {
      this.authDetails.status = 'Cannot send reset instructions'
      let data = err.json()
      if (data && data.error) {
        this.authDetails.status += ': ' + data.error
      }
    })
  }

  showLoginModal() {
    this.authDetails.status = ""
    this.authDetails.password = ""
    this.loginModal.show();
    this.registerModal.hide();
    this.forgotModal.hide();
  }

  showRegisterModal() {
    this.authDetails.status = ""
    this.authDetails.password = ""
    this.registerModal.show();
    this.loginModal.hide();
    this.forgotModal.hide();
  }

  showForgotModal() {
    this.authDetails.status = ""
    this.authDetails.password = ""
    this.forgotModal.show();
    this.loginModal.hide();
    this.registerModal.hide();
  }
}

export const MarketingRoutes: Routes = [
  {
    path: '', component: MarketingRouter, children: [
      { path: '', component: HomepageComponent },
      // {path: 'about-us', component: AboutUsComponent},
      { path: 'for-business', component: ForBusinessComponent },
      { path: 'drivers', component: DriversComponent },
      { path: 'contact-us', component: ContactComponent },
      { path: 'password-reset/:token', component: PasswordResetComponent }
    ]
  }
];
