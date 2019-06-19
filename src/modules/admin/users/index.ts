import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { APIService } from '../../providers/api.service';
import { User, UserPermission } from '../../providers/user.service';

import { AdminService } from '../admin.service'
import * as moment from 'moment/moment';

@Component({
	templateUrl: './users.pug',
 })
export class UsersComponent {
	users: any
	search = {
		name: "",
		email: "",
		membership: "",
		driver_license: ""
	}
	sortName = false
	debounceTimer: any = null

	constructor(private api: APIService, private router: Router, private adminService: AdminService) {
		this.users = []
		this.reload()
	}

	reload() {
		let params = []
		for (let p in this.search) {
			if (this.search[p].length == 0) continue;
			params.push(p + '=' + encodeURIComponent(this.search[p]))
		}

		if (this.sortName) params.push('sort=1')

		this.api.get('/admin/users?' + params.join('&')).subscribe(res => {
			this.users = res.json()
		})
	}

	doSearch() {
		if (this.debounceTimer) clearTimeout(this.debounceTimer)

		this.debounceTimer = setTimeout(this.reload.bind(this), 200)
	}

	openUser(user) {
		this.router.navigate([(this.adminService.canEdit ? '/admin/' : '/supervisor/') + 'users/', user._id, 'membership'])
	}

	updateSort() {
		this.sortName = !this.sortName
		this.reload()
	}
}

@Component({
	templateUrl: './user.pug',
 })
export class AdminUserComponent implements OnInit {
	user: User
	membership: any
	permissions: UserPermission
	newPassword: string
	userType = "driver"
	canEdit = false

	constructor(private api: APIService, private route: ActivatedRoute, private router: Router, private adminService: AdminService) {
		this.membership = null
		this.canEdit = adminService.canEdit
	}

	ngOnInit() {
		this.route.data.forEach((data: any) => {
			this.user = data.data.user;
			this.api.get('/admin/users/' + this.user._id + '/membership').subscribe(membership => {
				this.membership = membership.json()
			}, err => {
				// no membership
				this.userType = "user"
			})

			this.permissions = new UserPermission(data.data.permissions)
			if (this.permissions.superadmin) this.userType = "superadmin"
			else if (this.permissions.admin) this.userType = "admin"
			else if (this.permissions.supervisor) this.userType = "supervisor"
			if (this.permissions.mechanic) this.userType = "mechanic"

			if (this.user.protected) this.userType += ' (god)'
		})
	}

	changePassword(newPassword: string) {
		this.api.post('/admin/users/' + this.user._id + '/password', {
			password: this.newPassword
		}).subscribe(res => {
			this.newPassword = ""
		})
	}

	contactUser(user) {
		this.router.navigate(['/admin/messages', user._id])
	}
}