import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { APIService } from '../../providers/api.service';
import * as moment from 'moment/moment'
import { AdminService } from '../admin.service'

@Component({
	templateUrl: './wages.pug',
 })
export class UserWagesComponent {
	weeks: any
	canEdit = false

	constructor(private api: APIService,
		private route: ActivatedRoute,
		private router: Router,
		private adminService: AdminService) {
		this.canEdit = adminService.canEdit
	}

	ngOnInit() {
		let params = this.route.snapshot.parent.params
		// let params = this.router.routerState.parent(this.route).snapshot.params
		let userID = params['user_id']

		this.api.get('/admin/users/' + userID + '/shifts/history?paid=true').subscribe(res => {
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

				shift.durationHours = shift.duration / 1000 / 1000 / 1000 / 60 / 60
				shift.dateTimeFormatted = date.format('DD/MM HH:mm') + ' to ' + date.clone().add(shift.durationHours, 'hour').format('HH:mm')
				shift.dateFormatted = date.format('DD/MM/YYYY')
				shift.durationFormatted = moment(shift.check_in).to(moment(shift.check_out), true)

				weeks[periodID].total += shift.paid_amount;
				weeks[periodID].shifts.push(shift)
			}

			this.weeks = []
			for (let week in weeks) {
				this.weeks.push(weeks[week])
			}
		})
	}
}