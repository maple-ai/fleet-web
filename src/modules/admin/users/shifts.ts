import { ViewChild, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { APIService } from '../../providers/api.service';
import { User } from '../../providers/user.service';
import * as moment from 'moment/moment';
import { ModalDirective } from 'ng2-bootstrap';
import { AdminService } from '../admin.service';
import { Shift, ShiftDate, ShiftService } from '../../schedule/shift.service'

@Component({
	selector: 'admin-user-shifts',
	templateUrl: './shifts.pug',
	providers: [ShiftService]
})
export class UserShiftsComponent implements OnInit {
	@ViewChild('shiftModal', {static: true}) public shiftModal: ModalDirective;
	private absNow = moment(moment().format('DD/MM/YYYY'), 'DD/MM/YYYY')
	weeks: any = []
	garages: any = []
	month: ShiftDate
	selectedShift: Shift
	userID: string
	canEdit = false
	shift_settings: any = {
		shift_description: "",
		days: []
	}

	constructor(private api: APIService,
		private route: ActivatedRoute,
		private router: Router,
		private shiftService: ShiftService,
		private adminService: AdminService) {
		this.month = new ShiftDate()
		this.canEdit = adminService.canEdit
	}

	ngOnInit() {
		let params = this.route.snapshot.parent.params
		// let params = this.router.routerState.parent(this.route).snapshot.params
		this.userID = params['user_id']

		this.navigateMonth(0)
		this.adminService.getGarages().subscribe(garages => {
			this.garages = garages
		})
		this.api.get('/shift_settings').subscribe(res => {
			let d = res.json()

			for (let k of d) {
				this.shift_settings[k.name] = k.value;
			}
		})
	}

	navigateMonth(direction: number) {
		switch (direction) {
			case 1:
				// navigate forward by 1 month
				this.month.now.add(1, 'month')
				break
			case -1:
				// navigate backwards
				this.month.now.subtract(1, 'month')
				break
		}

		this.month.updateData()
		this.fetchSchedule()
	}

	fetchSchedule() {
		// re-Generate weeks
		this.weeks = this.shiftService.generateWeeks(this.month, this.absNow)

		this.api.get('/admin/users/' + this.userID + '/shifts?month=' + (this.month.month + 1) + '&year=' + this.month.now.year()).subscribe(res => {
			let data = res.json()

			this.shiftService.insertShiftsToWeeks(data, this.weeks)
		})
	}

	openShift(day, shift) {
		this.selectedShift = this.shiftService.newShift(day, shift, this.shift_settings.days)
		this.selectedShift.shift.garage_id = this.garages[0]._id
		this.getAvailability()

		this.shiftModal.show();
	}

	createShift() {
		this.selectedShift.create('/admin/users/' + this.userID + '/shifts', () => {
			this.shiftModal.hide()
			this.fetchSchedule()
		})
	}

	cancelShift() {
		this.api.delete('/admin/users/' + this.userID + '/shifts/' + this.selectedShift.shift._id).subscribe(res => {
			this.shiftModal.hide()
			this.fetchSchedule()
		}, (err) => {
			let d = err.json()

			this.selectedShift.status = "Cannot cancel"
			if (d && d.errors) {
				this.selectedShift.status += ": " + d.errors.join(", ")
			}
		})
	}

	getAvailability() {
		this.selectedShift.fetchAvailability('/admin/users/' + this.userID + '/shifts/search')
	}
}