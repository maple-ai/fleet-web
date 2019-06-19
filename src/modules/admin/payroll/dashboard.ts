import { Component, ViewChild } from '@angular/core'
import { APIService } from '../../providers/api.service'
import * as moment from 'moment/moment'
import { ModalDirective } from 'ng2-bootstrap';

@Component({
	templateUrl: './dashboard.pug',
})
export class PayrollComponent {
	@ViewChild('payoutModal', {static: true}) public payoutModal: ModalDirective;
	users: any;
	payoutUser: any;
	status: string;
	constructor(private api: APIService) {
		status = ""
	}

	ngOnInit() {
		this.api.get('/admin/payroll').subscribe(res => {
			let shifts = res.json();
			let userByIDs = {}
			this.users = []

			if (!shifts) return;

			for (let shift of shifts) {
				if (!userByIDs[shift.user_id]) {
					userByIDs[shift.user_id] = shift.user;
					userByIDs[shift.user_id].membership = shift.membership;
					userByIDs[shift.user_id].shifts = [];
					userByIDs[shift.user_id].total = 0;
				}

				shift.durationHours = moment(shift.check_out).diff(moment(shift.check_in), 'hours', true)
				shift.wages = Math.round(shift.durationHours * 8 * 100) / 100
				shift.wagesFormatted = shift.wages.toFixed(2)
				shift.dateFormatted = moment(shift.check_in).format('DD/MM/YYYY HH:mm') + ' - ' + moment(shift.check_out).format('HH:mm')

				userByIDs[shift.user_id].shifts.push(shift);
				userByIDs[shift.user_id].total += shift.durationHours * 8;
				userByIDs[shift.user_id].totalFormatted = (Math.round(userByIDs[shift.user_id].total * 100) / 100).toFixed(2)
			}

			for (let userID in userByIDs) {
				this.users.push(userByIDs[userID])
			}
		})
	}

	calculateTotal() {
		let total = 0
		for (let shift of this.payoutUser.shifts) {
			if (shift.removed) continue
			total += shift.total;
		}

		this.payoutUser.totalFormatted = (Math.round(total * 100) / 100).toFixed(2)
	}

	payUser(user: any) {
		this.payoutUser = user
		for (let shift of this.payoutUser.shifts) {
			shift.total = shift.wages
		}

		this.calculateTotal()
		this.payoutModal.show()
	}

	toggleShift(shift) {
		shift.removed = !shift.removed
		this.calculateTotal()
	}

	confirmPay() {
		let shiftTotals = []
		for (let shift of this.payoutUser.shifts) {
			shiftTotals.push({
				shift: shift._id,
				total: shift.total,
				removed: shift.removed === true
			})
		}

		this.status = "Paying.."
		this.api.post('/admin/payroll/payout', {
			user: this.payoutUser._id,
			shifts: shiftTotals
		}).subscribe(res => {
			this.ngOnInit()
			this.payoutModal.hide()
		}, err => {
			this.status = "Error paying user"
		})
	}
}