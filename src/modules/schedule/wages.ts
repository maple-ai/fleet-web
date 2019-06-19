import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { APIService } from '../providers/api.service';
import * as moment from 'moment/moment'

@Component({
	templateUrl: './wages.pug',
 })
export class WagesComponent {
	weeks: any

	constructor(private api: APIService, private router: Router) { }

	ngOnInit() {
		this.api.get('/shifts/history?paid=true').subscribe(res => {
			let shifts = res.json()
			let weeks = {}

			if (!shifts) return;

			for (let shift of shifts) {
				let date = moment(shift.date).utc()
				let periodID = date.year() + '-' + date.week()

				if (!weeks[periodID]) {
					weeks[periodID] = {
						week: date.year() + ', week ' + date.week(),
						shifts: [],
						total: 0
					}
				}

				shift.paid_amountFormatted = (Math.round(shift.paid_amount * 100) / 100).toFixed(2)
				shift.durationHours = moment(shift.check_out).diff(moment(shift.check_in), 'hours', true)
				shift.dateFormatted = moment(shift.check_in).format('DD/MM/YYYY HH:mm') + ' - ' + moment(shift.check_out).format('HH:mm')
				shift.durationFormatted = shift.durationHours.toFixed(2)

				weeks[periodID].total += shift.paid_amount;
				weeks[periodID].totalFormatted = (Math.round(weeks[periodID].total * 100) / 100).toFixed(2)
				weeks[periodID].shifts.push(shift)
			}

			this.weeks = []
			for (let week in weeks) {
				this.weeks.push(weeks[week])
			}
		})
	}
}