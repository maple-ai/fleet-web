import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { APIService } from '../../providers/api.service';
import { AdminService } from '../admin.service';
import { UserService } from '../../providers/user.service'

@Component({
	templateUrl: './bikes.pug',
 })
export class BikesComponent {
	bikes = []
	canEdit = false
	isMechanic = false

	constructor(private adminService: AdminService, private userService: UserService, private api: APIService) {
		this.canEdit = adminService.canEdit
		this.isMechanic = userService.permissions.mechanic

		adminService.getBikes().subscribe(bikes => {
			this.bikes = bikes;
			this.bikes.forEach(localBike => {
				localBike.maintenance_needed = false;
				localBike.shift_maintenance = false;
			})

			// fetch bikes needing attention
			this.api.get('/admin/bikes/maintenance').subscribe(bikes => {
				let data = bikes.json()
				if (!data) return;

				data.forEach(bike => {
					this.bikes.forEach(localBike => {
						if (bike._id == localBike._id) {
							localBike.maintenance_needed = true;
						}
					})
				})
			})

			this.api.get('/admin/bikes/shift_maintenance').subscribe(bikes => {
				let data = bikes.json()
				if (!data) return;

				data.forEach(bike => {
					this.bikes.forEach(localBike => {
						if (bike._id == localBike._id) {
							localBike.shift_maintenance = true;
						}
					})
				})
			})
		});
	}
}

@Component({
	templateUrl: './bikeEdit.pug',
 })
export class EditBikeComponent {
	bike: any = { garage_id: "" }
	garages = []
	wantsDelete = false
	deleteReason = ""

	constructor(private api: APIService, private route: ActivatedRoute, private adminService: AdminService, private router: Router) {
		this.route.params.subscribe(params => {
			let bikeID = params["bike_id"]

			if (bikeID) {
				adminService.getBike(bikeID).subscribe(bike => {
					this.bike = bike;
				})
			}
		})


		adminService.getGarages().subscribe(garages => {
			this.garages = garages;
		});
	}

	save() {
		if (this.bike._id) {
			this.api.put('/admin/bikes/' + this.bike._id, this.bike).subscribe(res => {
				this.adminService.fetchBikes().subscribe(_ => {
					this.router.navigate(['/admin/bikes']);
				});
			});

			return;
		}

		this.api.post('/admin/bikes', this.bike).subscribe(res => {
			this.adminService.fetchBikes().subscribe(_ => {
				this.router.navigate(['/admin/bikes']);
			});
		});
	}

	delete() {
		if (!this.wantsDelete) {
			this.wantsDelete = true
			// window.open("https://www.youtube.com/watch?v=QH2-TGUlwu4", "_blank")
			return
		}

		this.api.post('/admin/bikes/' + this.bike._id + '/archive', {
			reason: this.deleteReason
		}).subscribe(_ => {
			this.adminService.fetchBikes().subscribe(_ => {
				this.router.navigate(['/admin/bikes']);
			});
		})
	}
}
