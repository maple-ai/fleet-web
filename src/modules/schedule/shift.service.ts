import { Injectable } from '@angular/core'
import { APIService } from '../providers/api.service';
import * as moment from 'moment/moment';

export class ShiftDate {
	name: string
	now: any
	month: number

	constructor() {
		this.name = ""
		this.month = moment().month();
		this.now = moment().date(1);
	}

	updateData() {
		this.month = this.now.month();
		this.name = this.now.format('MMMM YYYY');
	}
}

export class Shift {
	status: string
	shift: any
	day: any
	weekend: boolean
	data: any
	availability: any
	selectedBike: any
	preferredHour: string
	availableHours: any

	constructor(private api: APIService) {
		this.status = ""
		this.data = {}
		this.availability = null
		this.selectedBike = null
		this.availableHours = []
		this.preferredHour = "0"
	}

	// Posts to specified URL (used for admin & driver schedule)
	create(url: string, successCallback = () => { }) {
		this.api.post(url, {
			garage_id: this.shift.garage_id,
			date: moment(this.day.fullFormat, 'DD/MM/YYYY').format('DD-MM-YYYY'),
			bike_id: this.selectedBike,
			hour: parseInt(this.preferredHour)
		}).subscribe(res => {
			this.status = "Shift Created"

			successCallback()
		}, err => {
			let d = err.json()

			this.status = "Cannot create shift"
			if (d && d.errors) {
				this.status += ": " + d.errors.join(", ")
			}
		})
	}

	fetchAvailability(searchURL: string) {
		let m = moment(this.day.fullFormat, 'DD-MM-YYYY')

		this.api.get(searchURL + '?date=' + m.format('DD-MM-YYYY') + '&garage=' + this.shift.garage_id).subscribe(res => {
			this.availability = res.json()
			if (!this.availability) this.availability = []
		})
	}

	setAvailableHours(day, availableSettings) {
		let weekday = moment(day.fullFormat, 'DD-MM-YYYY').isoWeekday()
		var found = null

		for (let d of availableSettings) {
			if (d.day != weekday) continue;

			found = d.hours
			break
		}

		if (!found) return;

		for (let h of found) {
			h.name = moment().set('hour', h.hour).format('h a')
		}

		this.availableHours = found;
	}
}

// ShiftService code is shared by admin and driver schedules
// When editing, make sure it works for both
@Injectable()
export class ShiftService {
	constructor(private api: APIService) { }

	// Generates one month calendar view of the current month selected
	// Controller should refresh shift data after this and feed it to insertShiftsToWeeks
	generateWeeks(month: any, absNow): any {
		var weeks = []

		let now = month.now.clone().date(1)
		let nowMonday = now.clone().day(1);
		if (now.day() == 1 && now.month() == month.month && now.date() > 1) {
			now.day(1 - 7)
		}

		do {
			let week = []
			for (var weekDay = 0; weekDay < 7; weekDay++) {
				let fullFormat = nowMonday.format('DD/MM/YYYY')
				week.push({
					weekDay: weekDay,
					weekDayName: nowMonday.format('dddd'),
					day: nowMonday.format('DD'),
					fullFormat: fullFormat,
					month: nowMonday.month(),
					shifts: [],
					canCreateShift: !nowMonday.isBefore(moment('12/09/2016', 'DD/MM/YYYY')),
					isToday: absNow.format('DD/MM/YYYY') == fullFormat
				});

				nowMonday.add(1, 'day')
			}

			weeks.push(week);
		} while (nowMonday.month() == now.month())

		return weeks
	}

	insertShiftsToWeeks(shifts, weeks) {
		if (!shifts) return;

		for (var shift of shifts) {
			let date = moment(shift.date).utc()
			let dateEnd = date.clone().add(shift.duration / 1000 / 1000 / 1000 / 60 / 60, 'hours');
			shift.formattedDate = date.format('DD/MM/YYYY');
			var found = false

			for (var wk of weeks) {
				for (var day of wk) {
					if (day.fullFormat == shift.formattedDate) {
						day.shifts.push(shift)
						found = true
						break
					}

					if (found !== false) break
				}

				if (found !== false) break
			}
		}
	}

	// Used to open modals (new/edit shift)
	// Controller should open its modal
	newShift(day, shift, availableSettings): Shift {
		var hour = 0
		if (!shift) {
			shift = {}
		} else {
			hour = moment(shift.date).hour()
		}

		let m = moment(day.fullFormat, 'DD-MM-YYYY')
		let dayOfWeek = m.day()

		let s = new Shift(this.api)
		s.shift = shift
		s.day = day
		s.weekend = dayOfWeek == 0 || dayOfWeek == 6
		s.selectedBike = shift.vehicle_id
		s.setAvailableHours(day, availableSettings)
		s.preferredHour = hour + ""

		return s
	}
}