import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { AdminService } from '../admin.service';
import { APIService } from '../../providers/api.service';

@Component({
	selector: 'admin-garages-list',
	templateUrl: './garages.pug',
})

export class GaragesComponent {
	garages = []
	canEdit = false

	constructor(private adminService: AdminService) {
		this.canEdit = adminService.canEdit

		adminService.getGarages().subscribe(garages => {
			this.garages = garages
		})
	}
}

@Component({
	selector: 'admin-edit-bike',
		templateUrl: './garage.pug',

})
export class EditGarageComponent {
	garage = {
		_id: "",
		name: "",
		capacity: 0,
		location: {
			lat: 0,
			lng: 0
		}
	}

	constructor(private api: APIService, private route: ActivatedRoute, private adminService: AdminService, private router: Router) {
		this.route.params.subscribe(params => {
			let garageID = params["garage_id"]

			if (garageID) {
				api.get('/admin/garages/' + garageID).subscribe(res => {
					if (res.status >= 400) {
						// err
						alert('whoa, error!');
						return;
					}

					this.garage = res.json()
				})
			}
		})
	}

	save() {
		if (this.garage._id) {
			this.api.put('/admin/garages/' + this.garage._id, this.garage).subscribe(res => {
				this.adminService.fetchGarages().subscribe(_ => {
					this.router.navigate(['/admin/garages']);
				});
			});

			return;
		}

		this.api.post('/admin/garages', this.garage).subscribe(res => {
			this.adminService.fetchGarages().subscribe(_ => {
				this.router.navigate(['/admin/garages']);
			});
		});
	}

	delete() {
		this.api.delete('/admin/garages/' + this.garage._id).subscribe(res => {
			this.adminService.fetchGarages().subscribe(_ => {
				this.router.navigate(['/admin/garages']);
			});
		})
	}
}