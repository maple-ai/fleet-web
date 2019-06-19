import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { APIService } from '../../providers/api.service';
import { User } from '../../providers/user.service';
import * as moment from 'moment/moment';
import { FileUploader } from 'ng2-file-upload/ng2-file-upload'
import { AdminService } from '../admin.service'

@Component({
		templateUrl: './membership.pug',

})
export class UserMembershipComponent implements OnInit {
	userID: string
	membership: any = {}
	cardDetails: any
	interviewForm: any
	status: string
	interviewDateStatus: string
	editImages = false
	canEdit = false
	garages: any = []

	uploader_front: FileUploader
	uploader_back: FileUploader
	uploader_cbt: FileUploader
	uploader_selfie: FileUploader
	uploader_passport: FileUploader
	uploader_utility: FileUploader

	constructor(private api: APIService, private route: ActivatedRoute, private router: Router, private adminService: AdminService) {
		this.status = ""
		this.interviewDateStatus = ""
		this.canEdit = adminService.canEdit
	}

	ngOnInit() {
		let params = this.route.snapshot.parent.params
		// let params = this.router.routerState.parent(this.route).snapshot.params
		this.userID = params['user_id']

		this.resetUpload()

		this.api.get('/garages').subscribe(res => {
			this.garages = res.json()
		})

		this.api.get('/admin/users/' + params['user_id'] + '/membership').subscribe(res => {
			if (res.status != 200) return;

			let d = res.json()
			if (d.dob) {
				d.dob = this.formatDate(d.dob)
			}
			if (d.interview_date) {
				let interviewDate = moment(d.interview_date)
				d.interview_date = this.formatDate(interviewDate);
				d.interview_time = interviewDate.format('HH:mm');
			}
			d.driver_license_expiry = this.formatDate(d.driver_license_expiry)
			d.cbt_expiry = this.formatDate(d.cbt_expiry)

			if (d.approved_date) {
				d.approvedDateFormatted = moment(d.approved_date).format('dddd, MMMM Do YYYY, h:mm:ss a')
			}

			this.membership = d;
			console.log(d)
		})

		// this.api.get('/admin/users/' + params['user_id'] + '/payment').subscribe(res => {
		// 	this.cardDetails = res.json()
		// })
	}

	formatDate(date): string {
		return moment(date).format('DD/MM/YYYY')
	}

	getDate(d) {
		let date = moment(d, 'DD/MM/YYYY')
		if (date.isValid() == false) return null;

		return date.toDate()
	}

	getDriverLicenseSrc(type: string) {
		return this.api.getHTTPAuth('/admin/users/' + this.userID + '/membership/license/' + type)
	}

	updateMembership() {
		var membership = JSON.parse(JSON.stringify(this.membership))
		membership.dob = this.getDate(membership.dob)
		membership.driver_license_expiry = this.getDate(membership.driver_license_expiry)
		membership.cbt_expiry = this.getDate(membership.cbt_expiry)
		membership.interview_date = moment(membership.interview_date + " " + membership.interview_time, 'DD/MM/YYYY HH:mm').toDate()
		this.status = 'Saving Membership'

		this.api.post("/admin/users/" + this.userID + "/membership", membership).subscribe(() => {
			this.status = 'Membership Saved'
		}, () => {
			this.status = 'Membership not saved'
		})
	}

	updateInterviewDate() {
		let interview_date = moment(this.membership.interview_date + "T" + this.membership.interview_time, 'DD/MM/YYYYTHH:mm')
		this.interviewDateStatus = "Saving Interview Date"

		let now = new Date
		if (interview_date.toDate().getTime() < now.getTime()) {
			this.interviewDateStatus = "Cannot set interview date in the past!"
			return
		}

		this.api.post("/admin/users/" + this.userID + "/membership/interview", {
			interview_date: interview_date
		}).subscribe(() => {
			this.interviewDateStatus = "Interview Date set"
		})
	}

	acceptApplication(accept: boolean) {
		var url = "/admin/users/" + this.userID + "/membership"
		var sub: any

		if (accept) {
			url += "/accept"
			sub = this.api.post(url, null)
		} else {
			sub = this.api.delete(url)
		}

		sub.subscribe(res => {
			this.ngOnInit()
		})
	}

	uploadIf(uploader) {
		if (uploader.queue.length == 0) return;
		if (uploader.queue[0].isSuccess) return;
		if (uploader.queue[0].isUploading) return;

		uploader.queue[0].upload()
	}
	uploadLicenses() {
		this.uploadIf(this.uploader_front)
		this.uploadIf(this.uploader_selfie)
		this.uploadIf(this.uploader_passport)
		this.uploadIf(this.uploader_back)
		this.uploadIf(this.uploader_cbt)
		this.uploadIf(this.uploader_utility)
	}

	resetUpload() {
		this.uploader_cbt = new FileUploader({
			url: this.api.getEndpoint('/admin/users/' + this.userID + '/license/cbt'),
			authToken: this.api.getToken()
		})
		this.uploader_front = new FileUploader({
			url: this.api.getEndpoint('/admin/users/' + this.userID + '/license/front'),
			authToken: this.api.getToken()
		})
		this.uploader_selfie = new FileUploader({
			url: this.api.getEndpoint('/admin/users/' + this.userID + '/license/selfie'),
			authToken: this.api.getToken()
		})
		this.uploader_passport = new FileUploader({
			url: this.api.getEndpoint('/admin/users/' + this.userID + '/license/passport'),
			authToken: this.api.getToken()
		})
		this.uploader_back = new FileUploader({
			url: this.api.getEndpoint('/admin/users/' + this.userID + '/license/back'),
			authToken: this.api.getToken()
		})
		this.uploader_utility = new FileUploader({
			url: this.api.getEndpoint('/admin/users/' + this.userID + '/license/utility'),
			authToken: this.api.getToken()
		})
	}

	deleteImages() {
		this.api.delete('/admin/users/' + this.userID + '/license/cbt').subscribe(res => { })
		this.api.delete('/admin/users/' + this.userID + '/license/front').subscribe(res => { })
		this.api.delete('/admin/users/' + this.userID + '/license/back').subscribe(res => { })
		this.api.delete('/admin/users/' + this.userID + '/license/selfie').subscribe(res => { })
		this.api.delete('/admin/users/' + this.userID + '/license/passport').subscribe(res => { })
		this.api.delete('/admin/users/' + this.userID + '/license/utility').subscribe(res => { })

		this.editImages = false;
	}

	getStripeHref() {
		if (this.cardDetails == null) return ''

		var url = 'https://dashboard.stripe.com/'
		if (this.cardDetails.customer.livemode == false) {
			url += 'test/'
		}

		return url + 'customers/' + this.cardDetails.customer.id
	}

	moveToOnboarding() {
		this.api.delete("/admin/users/" + this.userID + "/membership/onboarding").subscribe(res => {
			this.ngOnInit()
		})
	}
}