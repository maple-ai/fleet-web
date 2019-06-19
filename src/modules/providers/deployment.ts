import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Settings } from '../types/Settings';

const defaultCurrency = '$SGD';
const defaultLogo = '/assets/maple.png';

@Injectable()
export class SiteDeploymentService {
  public settings: Settings = null;
  private checksum: any = '';

  private loaded = false;

  constructor(private http: HttpClient) {
  }

  load() {
    if (this.loaded) return;
    this.loaded = true;

    try {
      let data = JSON.parse(localStorage.getItem('site_deployment')) || null;
      if (!data || !data.data) return;

      this.settings = data.data;
      this.checksum = data.checksum;
    } catch (e) {
    }
  }

  getSettings(force?: boolean) {
    return new Promise<any>((resolve, reject) => {
      if (force !== true && this.settings) {
        return resolve(this.settings);
      }

      // skip checksum check if no checksum
      if (!this.settings || !this.checksum || this.checksum == '') {
        return this.fetch(resolve, reject);
      }

      this.http.head('/deployment', {
        observe: 'response',
      }).subscribe(res => {
        let checksum = res.headers.get('x-checksum');
        if (this.checksum == checksum) {
          return resolve(this.settings);
        }

        this.fetch(resolve, reject);
      }, err => {
        reject();
      });
    });
  }

  private fetch(resolve, reject) {
    this.http.get('/deployment', {
      observe: 'response',
    }).subscribe(res => {
      this.settings = (<any>res.body) || {};
      resolve(this.settings);

      localStorage.setItem('site_deployment', JSON.stringify({
        data: this.settings,
        checksum: res.headers.get('x-checksum'),
      }));
    }, err => {
      reject();
    });
  }

  getCurrency() {
    if (!this.settings) {
      return defaultCurrency;
    }

    return this.settings.currency || defaultCurrency;
  }

  getSiteName() {
    if (!this.settings) {
      return 'Maple';
    }

    return this.settings.name || 'Maple';
  }

  getLogo() {
    if (!this.settings || !this.settings.logo) {
      return defaultLogo;
    }

    return this.settings.logo.access_url;
  }
}
