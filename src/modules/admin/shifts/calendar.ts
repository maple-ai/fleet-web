import { Component, ViewChild } from '@angular/core'
import { Router } from '@angular/router'
import { ModalDirective } from 'ng2-bootstrap';

import { APIService } from '../../providers/api.service'
import * as moment from 'moment/moment'
import { AdminService } from '../admin.service'

@Component({
	templateUrl: './calendar.pug',
 })
export class ShiftsComponent {
	@ViewChild('shiftModal', {static: true}) public shiftModal: ModalDirective;

	selectedShift: any
	sections: any
	bikes: any = []
	freeBikes: any = []
	cancelledShifts: any = []
	currentDay = {
		dayFormatted: "",
		date: null
	}
	trueTodayFormatted: string

	constructor(private api: APIService, private router: Router, private adminService: AdminService) {
		this.trueTodayFormatted = moment().format('DD/MM/YYYY')
	}

	ngOnInit() {
		this.currentDay.date = moment()
		if (localStorage["shifts_date"]) {
			this.currentDay.date = moment(localStorage["shifts_date"])
		}

		this.currentDay.dayFormatted = this.currentDay.date.format('DD/MM/YYYY')

		this.api.get('/admin/bikes?available=1').subscribe(res => {
			this.bikes = res.json()
			this.refreshCalendar()
		})
	}

	navigateDay(forward: boolean) {
		this.currentDay.date.add(forward ? 1 : -1, 'day')
		this.currentDay.dayFormatted = this.currentDay.date.format('DD/MM/YYYY')
		localStorage["shifts_date"] = this.currentDay.date.toISOString()

		this.refreshCalendar()
	}

	jumpToday() {
		localStorage.removeItem("shifts_date")
		this.ngOnInit()
	}

	refreshCalendar() {
		this.api.get('/admin/calendar?day=' + this.currentDay.date.format('DD-MM-YYYY')).subscribe(res => {
			let bikeShifts = res.json()
			if (bikeShifts == null) bikeShifts = []

			this.sections = []
			this.cancelledShifts = []
			this.freeBikes = []

			var section = [];
			this.bikes.forEach((bike, i) => {
				bike.shifts = [];

				bikeShifts.forEach(shift => {
					if (shift._id == bike._id) {
						let shifts = shift.shifts;

						shifts.forEach(s => {
							s.dateTimeFormatted = moment(s.date).utc().format('HH:mm')
							s.dateTimeEndFormatted = moment(s.date).utc().add(s.duration / 1000 / 1000 / 1000 / 60 / 60, 'hours').format('HH:mm')

							if (s.status != "cancelled") {
								bike.shifts.push(s)
							} else {
								// add to cancelled shifts
								s.bike = bike;
								s.reassigned_bike = ""
								this.cancelledShifts.push(s);
							}
						})
					}
				})

				if (bike.shifts.length == 0) {
					this.freeBikes.push(bike);
				}
				section.push(bike);

				if (i % 4 == 3 || i == this.bikes.length - 1) {
					this.sections.push(section)
					section = [];
				}
			})
		})
	}

	reassignBike(shift) {
		this.api.post('/admin/shifts/' + shift._id + '/reassign/' + shift.reassigned_bike, {}).subscribe(res => {
			this.refreshCalendar()
		})
	}

	openUser(user: any, evt) {
		this.router.navigate([(this.adminService.canEdit ? '/admin' : '/supervisor') + '/users', user._id, 'shifts'])
		evt.stopPropagation()
	}

	openShift(vehicle, shift: any) {
		if (shift.status == "created") {
			this.selectedShift = shift
			this.shiftModal.show()

			return
		}

		this.router.navigate([(this.adminService.canEdit ? '/admin' : '/supervisor') + '/shifts', shift._id])
	}

	removeShift() {
		this.api.delete('/admin/shifts/' + this.selectedShift._id + '/status').subscribe(res => {
			this.shiftModal.hide()
			this.refreshCalendar()
		})
	}

	approveShift() {
		this.api.post('/admin/shifts/' + this.selectedShift._id + '/status', {}).subscribe(res => {
			this.shiftModal.hide()
			this.refreshCalendar()
		})
	}
}
