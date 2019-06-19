import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { APIService } from '../providers/api.service';
import * as moment from 'moment/moment'

@Component({ 
	selector: 'history',
	templateUrl: '././history.pug',
})
export class HistoryComponent {
	shifts: any

	constructor(private api: APIService, private router: Router) { }

	ngOnInit() {
		this.api.get('/shifts/history').subscribe(res => {
			this.shifts = res.json()

			for (let shift of this.shifts) {
				shift.durationHours = moment(shift.check_out).diff(moment(shift.check_in), 'hours', true)
				shift.wages = (Math.round(shift.durationHours * 8 * 100) / 100).toFixed(2)
				shift.dateFormatted = moment(shift.check_in).format('DD/MM/YYYY HH:mm') + ' - ' + moment(shift.check_out).format('HH:mm')
				if (shift.paid) {
					shift.totalFormatted = (Math.round(shift.paid_amount * 100) / 100).toFixed(2)
				}

				shift.durationFormatted = shift.durationHours.toFixed(2)
			}
		})
	}

	downloadCSV() {
		let csv = ''

		csv += ['Date', 'Start - End', 'Status', 'Wages'].join(',') + '\n'
		for (let shift of this.shifts) {
			csv += [shift.dateFormatted,
			shift.dateTimeFormatted + ' - ' + shift.dateTimeEndFormatted,
			shift.status,
			shift.paid ? shift.paid_amount : shift.durationHours * 7.50
			].join(',') + '\n'
		}

		let a = document.createElement("a");
		a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
		a.click();
	}
}