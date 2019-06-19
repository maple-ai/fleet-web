import { Component } from '@angular/core'
import { APIService } from '../providers/api.service'

@Component({
		templateUrl: './settings.pug',

})
export class SiteSettingsComponent {
	settings: any

	constructor(private api: APIService) {
		this.reset()
	}

	ngOnInit() {
		this.api.get('/admin/settings').subscribe(res => {
			let d = res.json()
			if (!d) {
				return
			}

			for (let k of d) {
				this.settings[k.name] = k.value;
			}
			console.log(this.settings)
		})
	}

	reset() {
		this.settings = {
			shift_description: "",
			days: [{
				name: "Monday",
				day: 1,
				hours: []
			}, {
				name: "Tuesday",
				day: 2,
				hours: []
			}, {
				name: "Wednesday",
				day: 3,
				hours: []
			}, {
				name: "Thursday",
				day: 4,
				hours: []
			}, {
				name: "Friday",
				day: 5,
				hours: []
			}, {
				name: "Saturday",
				day: 6,
				hours: []
			}, {
				name: "Sunday",
				day: 7,
				hours: []
			}]
		}
	}

	save() {
		let d = [{
			name: 'shift_description',
			value: this.settings.shift_description
		}, {
			name: 'days',
			value: this.settings.days
		}]

		this.api.post('/admin/settings', d).subscribe(res => {
			alert('saved')
		}, err => {
			alert('error saving')
		})
	}
}