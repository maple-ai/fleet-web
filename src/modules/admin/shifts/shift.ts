import { Component, ViewChild, ElementRef } from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'
import * as moment from 'moment/moment'

import { APIService } from '../../providers/api.service'
import { AdminService } from '../admin.service'

declare var ol;
declare var Highcharts;

@Component({
	templateUrl: './shift.pug',
 })
export class ShiftComponent {
	@ViewChild('googleMap', {static: true}) googleMap: ElementRef;
	@ViewChild('speedChart', {static: true}) speedChart: ElementRef;
	shift: any
	status: string
	locationHistory: any
	state: string = "operator"
	operatorNotes: any = {}
	operatorNotesStatus: string
	canEditNotes = true
	clickedResetAlready = false
	routerDestination = "/admin"

	constructor(private api: APIService, private route: ActivatedRoute, private adminService: AdminService, private router: Router) {
		if (adminService.canEdit == false) {
			this.routerDestination = '/supervisor'
		}
	}

	ngOnInit() {
		this.api.get('/admin/shifts/' + this.route.snapshot.params["shift_id"]).subscribe(res => {
			this.shift = res.json()
			this.formatDates()

			if (this.shift.check_in) this.fetchLocationHistory()

			this.api.get('/admin/shifts/' + this.shift._id + '/operator-notes').subscribe(res => {
				this.operatorNotes = res.json()
				this.operatorNotes.checkedAtFormatted = moment(this.operatorNotes.checked_at).format('DD/MM/YYYY HH:mm')
				if (this.operatorNotes.checked_at == "0001-01-01T00:00:00Z") {
					this.operatorNotes.checkedAtFormatted = "never"
				}
			})
		})
	}

	getDriverLicenseSrc() {
		return this.api.getHTTPAuth('/admin/users/' + this.shift.user[0]._id + '/membership/license/front')
	}

	checkIn(data, cb) {
		if (typeof cb != 'function') cb = () => { }
		this.status = ''

		this.api.post('/admin/shifts/' + this.shift._id + '/check-in', data).subscribe(res => {
			let data = res.json()
			this.shift.check_in = data.check_in;
			this.shift.status = data.status

			cb()
			this.formatDates()
		}, err => {
			this.status = 'Cannot check in'
			let data = err.json()
			if (data && data.error) {
				this.status += ': ' + data.error
			}
		})
	}

	checkOut(data) {
		this.status = ''

		this.api.post('/admin/shifts/' + this.shift._id + '/check-out', data).subscribe(res => {
			let data = res.json()
			this.shift.check_out = data.check_out;
			this.shift.status = data.status

			this.formatDates()
		}, err => {
			this.status = 'Cannot check out'
			let data = err.json()
			if (data && data.error) {
				this.status += ': ' + data.error
			}
		})
	}

	saveCheckIn() {
		let checkIn = moment(moment(this.shift.date).format('DD/MM/YY') + ' ' + this.shift.checkInFormatted, 'DD/MM/YY HH:mm')
		let checkOut = moment(moment(this.shift.date).format('DD/MM/YY') + ' ' + this.shift.checkOutFormatted, 'DD/MM/YY HH:mm')

		checkIn.isValid() && this.checkIn({ date: checkIn }, () => {
			checkOut.isValid() && this.checkOut({ date: checkOut })
		})
	}

	resetShift() {
		if (!this.clickedResetAlready) return this.clickedResetAlready = true;

		this.api.post('/admin/shifts/' + this.shift._id + '/reset', null).subscribe(res => {
			this.shift.check_in = null;
			this.shift.check_out = null;
			this.shift.status = 'scheduled'

			this.formatDates()
			this.clickedResetAlready = false
		}, err => {
			this.status = 'Cannot reset shift'
			let data = err.json()
			if (data && data.error) {
				this.status += ': ' + data.error
			}
		})
	}

	deleteShift() {
		this.api.delete('/admin/shifts/' + this.shift._id + '/status').subscribe(res => {
			this.router.navigate(['../'], { relativeTo: this.route })
		})
	}

	formatDates() {
		let end = moment(this.shift.date).utc().add(this.shift.duration / 1000 / 1000 / 1000 / 60 / 60, 'hours')
		let start = moment(this.shift.date).utc()

		this.shift.dateTimeFormatted = start.format('HH:mm')
		this.shift.dateTimeEndFormatted = end.format('HH:mm')
		this.shift.durationFormatted = start.from(end, true)

		if (!this.shift.check_in) {
			this.shift.checkInFormatted = ""
		} else {
			this.shift.checkInFormatted = moment(this.shift.check_in).format('HH:mm')
		}

		if (!this.shift.check_out) {
			this.shift.checkOutFormatted = ""
		} else {
			this.shift.checkOutFormatted = moment(this.shift.check_out).format('HH:mm')
		}
	}

	saveNotes() {
		this.api.post('/admin/shifts/' + this.shift._id + '/notes', {
			notes: this.shift.notes
		}).subscribe(() => { }, err => {
			this.status = 'Cannot save notes'
			let data = err.json()
			if (data && data.error) {
				this.status += ': ' + data.error
			}
		})

		this.fetchLocationHistory()
	}

	setState(state: string) {
		if (state === this.state) return;
		this.state = state
		if (state == 'map' || state == 'speed') {
			this.fetchLocationHistory()
		}
	}

	setFuelLevel(level: number) {
		this.operatorNotes.fuel_level = level
	}

	checkedCondition() {
		this.operatorNotes.checked_at = new Date()
		this.operatorNotes.checkedAtFormatted = moment().format("DD/MM/YYYY HH:mm")
	}

	requestMechanicAttention() {
		this.operatorNotes.mechanic_required = !this.operatorNotes.mechanic_required;
		if (!this.operatorNotes.mechanic_required) this.operatorNotes.mechanic_alert_reason = '';
	}

	saveOperatorNotes() {
		this.operatorNotesStatus = "Saving.."
		this.api.post('/admin/shifts/' + this.shift._id + '/operator-notes', this.operatorNotes).subscribe(res => {
			this.operatorNotesStatus = "Saved"
		}, err => {
			this.operatorNotesStatus = "Error: not saved"
		})
	}

	fetchLocationHistory() {
		this.api.get('/admin/shifts/' + this.shift._id + '/positions').subscribe(res => {
			let data = res.json()
			this.locationHistory = []

			for (let o of data) {
				if (o.valid == false) continue;
				this.locationHistory.push(o);
			}

			let positions = []
			for (let o of data) {
				if (o.valid == false) continue;

				o.fixTimeFormatted = moment(o.fixTime).format('HH:mm:ss')

				positions.push({
					position: [o.longitude, o.latitude],
					rotation: o.course * Math.PI / 180,
					data: {
						speed: o.speed,
						time: new Date(o.fixTime)
					}
				})
			}

			this.render(positions)
		})
	}

	render(data: any) {
		var checkExists = typeof ol
		var url = "/vendor/openlayers.js"
		var callback = this.renderMap.bind(this)

		if (this.state != 'map') {
			checkExists = typeof Highcharts
			url = "/vendor/highstock.js"
			callback = this.renderSpeed.bind(this)
		}

		if (checkExists != 'undefined') return callback(data)
		let script = document.createElement("script")
		script.async = true
		script.src = url
		script.onload = () => {
			callback(data)
		}

		window.document.getElementsByTagName("head")[0].appendChild(script)
	}

	renderSpeed(track: any) {
		if (typeof this.speedChart == 'undefined') return;
		var values = []
		for (let o in track) {
			var time = moment(track[o].data.time)
			values[o] = [time.valueOf(), track[o].data.speed];
		}

		let chart = new Highcharts.Chart({
			chart: {
				renderTo: this.speedChart.nativeElement,
				type: 'area',
				zoomType: 'x'
			},
			credits: {
				enabled: false
			},
			title: {
				text: this.shift.user[0].name + ' (' + this.shift.bike[0].registration + ')'
			},
			subtitle: {
				text: this.shift.dateTimeFormatted + ' - ' + this.shift.dateTimeEndFormatted + ' (' + this.shift.durationFormatted + ')'
			},
			xAxis: {
				type: 'datetime'
			},
			legend: {
				enabled: false
			},
			tooltip: {
				valueSuffix: ' mph',
				valueDecimals: 1
			},
			yAxis: {
				title: {
					text: 'Speed [mph]'
				},
				plotLines: [{
					value: 30,
					color: 'red',
					dashStyle: 'shortdot',
					width: 2,
					label: {
						text: '30 MPH'
					}
				}, {
					value: 50,
					color: 'red',
					dashStyle: 'shortdot',
					width: 2,
					label: {
						text: '50 MPH'
					}
				}]
			},
			series: [{
				name: 'Speed',
				color: '#07aa88',
				fillOpacity: 0.5,
				data: values,
				gapSize: 5 * 60
			}]
		})
	}

	renderMap(track) {
		if (typeof this.googleMap == 'undefined' || track.length == 0) return;

		let markers = new ol.source.Vector({});
		var points = [];

		for (let o of track) {
			let coords = ol.proj.fromLonLat(o.position)
			let marker = new ol.Feature(new ol.geom.Point(coords))

			points.push(coords)
			markers.addFeature(marker)

			marker.setStyle(new ol.style.Style({
				image: new ol.style.Icon(({
					src: '/vendor/arrow.png',
					rotation: o.rotation,
				}))
			}))
		}

		let bing = new ol.layer.Tile({
			source: new ol.source.BingMaps({
				key: 'AjWCx6ohcjZYLm83o6zGE9KKvw_RQ-Xz-8Svxkk7ISy5ecB-DSx87ADHVx40T2l9',
				imagerySet: 'Road'
			})
		});
		let reportSourceLayer = new ol.layer.Vector({ source: markers });

		var layerLines = new ol.layer.Vector({
			source: new ol.source.Vector({
				features: [new ol.Feature({
					geometry: new ol.geom.LineString(points),
					name: 'Line'
				})]
			}),
			style: new ol.style.Style({
				stroke: new ol.style.Stroke({
					color: "#008967",
					width: 4
				})
			})
		});

		var map = new ol.Map({
			layers: [bing, layerLines, reportSourceLayer],
			target: this.googleMap.nativeElement,
			view: new ol.View({
				center: ol.proj.fromLonLat(track[0].position),
				zoom: 10,
				minZoom: 9
			})
		});
	}
}