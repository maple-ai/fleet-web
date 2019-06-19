import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { APIService } from '../providers/api.service';
import * as moment from 'moment/moment';
import { ModalDirective } from 'ng2-bootstrap';

import { Shift, ShiftDate, ShiftService } from './shift.service'

@Component({
	selector: 'driver-schedule',
	templateUrl: './schedule.pug',
	providers: [ShiftService],
})
export class ScheduleComponent {
	@ViewChild('shiftModal', {static: true}) public shiftModal: ModalDirective;
	private absNow = moment(moment().format('DD/MM/YYYY'), 'DD/MM/YYYY')
	weeks: any = []
	garages: any = []
	month: ShiftDate
	selectedShift: Shift
	shift_settings: any = {
		shift_description: "",
		days: []
	}

	constructor(private api: APIService, private router: Router, private shiftService: ShiftService) {
		this.month = new ShiftDate()
	}

	ngOnInit() {
		this.api.get('/garages').subscribe(res => {
			this.garages = res.json()
		})
		this.api.get('/shift_settings').subscribe(res => {
			let d = res.json()

			for (let k of d) {
				this.shift_settings[k.name] = k.value;
			}
		})

		this.navigateMonth(0)
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

		this.api.get('/shifts?month=' + (this.month.month + 1) + '&year=' + this.month.now.year()).subscribe(res => {
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
		this.selectedShift.create('/shifts', () => {
			this.shiftModal.hide()
			this.fetchSchedule()
		})
	}

	cancelShift() {
		this.api.delete('/shifts/' + this.selectedShift.shift._id).subscribe(res => {
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
		this.selectedShift.fetchAvailability('/shifts/search')
	}
}