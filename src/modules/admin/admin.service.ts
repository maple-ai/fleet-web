import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { APIService } from '../providers/api.service';

@Injectable()
export class AdminService {
	private garages: any[]
	private bikes: any[]
	canEdit = false

	constructor(private api: APIService) {
		this.garages = []
		this.bikes = []
	}

	private fetch(url: string, property: any) {
		return Observable.create(observer => {
			this.api.get(url).subscribe(res => {
				if (res.status > 400) {
					console.log(res);
					return;
				}

				this[property] = res.json();
				observer.next(this[property]);
				observer.complete();
			});
		});
	}

	private getOrFetch(prop: string, fetchFn: any) {
		return Observable.create(observer => {
			if (this[prop] && this[prop].length > 0) {
				observer.next(this[prop]);
				observer.complete();
				return;
			}

			fetchFn().subscribe(p => {
				observer.next(p);
				observer.complete();
			});
		});
	}

	fetchGarages() {
		return this.fetch('/admin/garages', 'garages');
	}

	fetchBikes() {
		return this.fetch('/admin/bikes', 'bikes');
	}

	getGarages() {
		return this.getOrFetch('garages', this.fetchGarages.bind(this));
	}

	getBikes() {
		return this.getOrFetch('bikes', this.fetchBikes.bind(this));
	}

	getBike(ID: string) {
		return Observable.create(observer => {
			for (var bike of this.bikes) {
				if (bike._id != ID) {
					continue;
				}

				observer.next(bike);
				observer.complete();
				return;
			}

			this.api.get('/admin/bikes/' + ID).subscribe(res => {
				if (res.status >= 400) {
					console.log(res);
					return;
				}

				observer.next(res.json());
				observer.complete();
			});
		});
	}
}