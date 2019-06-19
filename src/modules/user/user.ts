import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService, User } from '../providers/user.service';
import { APIService } from '../providers/api.service';

@Component({
	selector: 'user',
		templateUrl: './profile.pug',

})
export class UserComponent {
	user: User
	membership: any
	newPassword = {
		status: "",
		password: "",
		confirm: "",
		current: ""
	}
	status = ""

	constructor(private userService: UserService, private api: APIService, private router: Router) { }

	ngOnInit() {
		this.user = this.userService.getUser()
		this.api.get('/user/membership').subscribe(res => {
			this.membership = res.json()
		})
	}

	getDriverLicenseSrc() {
		return this.api.getHTTPAuth('/user/license/photo')
	}

	changePassword() {
		this.api.post('/user/password', {
			new_password: this.newPassword.password,
			password: this.newPassword.current
		}).subscribe(res => {
			this.newPassword.status = "Password Changed"
		}, res => {
			this.newPassword.status = "Error changing password"

			let data = res.json()
			if (data && data.error) {
				this.newPassword.status += ": " + data.error
			}
		})
	}

	saveProfile() {
		var profile: any = {
			name: this.user.name,
			email: this.user.email
		}

		if (this.membership != null) {
			profile.address = this.membership.address
			profile.postcode = this.membership.postcode
			profile.city = this.membership.city
			profile.phone_number = this.membership.phone_number
		}

		this.api.put('/user/profile', profile).subscribe(res => {
			this.status = "Profile Saved"
		}, res => {
			this.status = "Error saving profile"

			let data = res.json()
			if (data && data.errors) {
				this.status += ": " + data.errors.join(', ')
			}
		})
	}

	logout() {
		this.userService.logout()
		this.router.navigate(['../'])
	}
}