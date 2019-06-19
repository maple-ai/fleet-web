import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { APIService } from '../../providers/api.service';
import { AdminService } from '../admin.service';
import { FileUploader } from 'ng2-file-upload/ng2-file-upload'
import { UserService } from '../../providers/user.service'

import * as moment from 'moment/moment'

@Component({
	templateUrl: './maintenance.pug',
})

export class BikeMaintenanceComponent {
	bike: any
	notes: any
	operatorNotes: any
	status: string
	uploader: FileUploader
	isMechanic: boolean

	constructor(private router: Router, private route: ActivatedRoute, private api: APIService, private adminService: AdminService, private userService: UserService) { }

	ngOnInit() {
		this.isMechanic = this.userService.permissions.mechanic

		let bikeID = this.route.snapshot.parent.params["bike_id"]
		// let bikeID = this.router.routerState.parent(this.route).snapshot.params["bike_id"]
		this.adminService.getBike(bikeID).subscribe(bike => {
			this.bike = bike;
			this.refresh()
		})
	}

	refresh(cb = function () { }) {
		this.api.get('/admin/bikes/' + this.bike._id + '/maintenance').subscribe(res => {
			this.notes = res.json()
			if (this.notes == null) {
				this.notes = []
			}

			for (let note of this.notes) {
				note.checkedAtFormatted = moment(note.checked_at).format('DD/MM/YY HH:mm')
				note.checked_at = moment(note.checked_at).format('YYYY-MM-DDTHH:mm')
			}

			cb()
		})
	}

	openNote(note) {
		this.status = ''
		this.operatorNotes = note

		this.uploader = new FileUploader({
			url: this.api.getEndpoint('/admin/bikes/' + this.bike._id + '/maintenance/' + this.operatorNotes._id + '/attachment'),
			authToken: this.api.getToken()
		})
	}

	deleteNote() {
		this.api.delete('/admin/bikes/' + this.bike._id + '/maintenance/' + this.operatorNotes._id).subscribe(res => {
			this.ngOnInit()

			this.status = ''
			this.operatorNotes = null
		})
	}

	saveNotes() {
		this.status = 'Saving'
		let note = JSON.parse(JSON.stringify(this.operatorNotes))
		note.checked_at = moment(note.checked_at, 'YYYY-MM-DDTHH:mm')

		this.api.put('/admin/bikes/' + this.bike._id + '/maintenance' + '/' + note._id, note).subscribe(res => {
			this.status = 'Log Updated'
			this.ngOnInit()
		})
	}

	openAttachment() {
		window.open(this.api.getHTTPAuth('/admin/bikes/' + this.bike._id + '/maintenance/' + this.operatorNotes._id + '/attachment'), '_blank')
	}

	uploadAttachment() {
		if (this.uploader.queue.length == 0) return;
		if (this.uploader.queue[0].isSuccess) return;
		if (this.uploader.queue[0].isUploading) return;

		this.uploader.queue[0].upload()

		this.operatorNotes.has_attachment = true;
		this.saveNotes()
	}

	deleteAttachment() {
		this.api.delete('/admin/bikes/' + this.bike._id + '/maintenance/' + this.operatorNotes._id + '/attachment').subscribe(res => {
			this.uploader = new FileUploader({
				url: this.api.getEndpoint('/admin/bikes/' + this.bike._id + '/maintenance/' + this.operatorNotes._id + '/attachment'),
				authToken: this.api.getToken()
			})

			this.operatorNotes.has_attachment = false;
			this.saveNotes()
		})
	}

	requestMechanicAttention() {
		this.operatorNotes.mechanic_required = !this.operatorNotes.mechanic_required;
		this.saveNotes()
	}

	newLog() {
		let note = JSON.parse(JSON.stringify({}))
		note.checked_at = moment()

		this.api.post('/admin/bikes/' + this.bike._id + '/maintenance', note).subscribe(res => {
			this.status = 'Log Created'
			this.refresh(() => {
				this.openNote(this.notes[0])
			})
		})
	}
}
