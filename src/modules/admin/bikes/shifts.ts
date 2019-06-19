import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { APIService } from '../../providers/api.service';
import { AdminService } from '../admin.service';
import { UserService } from '../../providers/user.service';

import * as moment from 'moment/moment'

@Component({
	selector: 'bike-shift',
	templateUrl: 'shifts.pug',
 })
export class BikeShiftsComponent {
	bike: any
	notes: any
	operatorNotes: any
	canEditNotes = false
	isMechanic: boolean

	constructor(private router: Router, private route: ActivatedRoute, private api: APIService, private adminService: AdminService, private userService: UserService) { }

	ngOnInit() {
		this.isMechanic = this.userService.permissions.mechanic;

		let bikeID = this.route.snapshot.parent.params["bike_id"]
		// let bikeID = this.router.routerState.parent(this.route).snapshot.params["bike_id"]
		this.adminService.getBike(bikeID).subscribe(bike => {
			this.bike = bike;
		})

		this.api.get('/admin/bikes/' + bikeID + '/operator-notes').subscribe(res => {
			this.notes = res.json()

			for (let note of this.notes) {
				note.shiftDateFormatted = moment(note.shift[0].date).format('DD/MM/YYYY HH:mm')
				note.checkedAtFormatted = moment(note.checked_at).format('DD/MM/YYYY HH:mm')
				if (note.checkedBy.length > 0) {
					note.checkedAtFormatted += ' by ' + note.checkedBy[0].name
				}
			}
		})
	}

	requestMechanicAttention() {
		this.operatorNotes.mechanic_required = !this.operatorNotes.mechanic_required;
		if (!this.operatorNotes.mechanic_required) this.operatorNotes.mechanic_alert_reason = '';

		this.api.post('/admin/shifts/' + this.operatorNotes.shift_id + '/operator-notes', this.operatorNotes).subscribe(res => { })
	}

	openNote(note) {
		this.operatorNotes = note
	}
}
