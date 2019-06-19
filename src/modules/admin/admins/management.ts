import { Component } from '@angular/core'
import { Router } from '@angular/router'

import { APIService } from '../../providers/api.service'
import * as moment from 'moment/moment'

@Component({
	templateUrl: './management.pug',
 })
export class AdminManagementComponent {
	users: any

	constructor(private api: APIService, private router: Router) { }

	ngOnInit() {
		this.api.get('/admin/admins').subscribe(res => {
			let perms = res.json()

			this.users = []
			for (let perm of perms) {
				if (perm.user.length == 0) continue;

				let user = perm.user[0];
				user.user_type = perm.type;
				if (user.protected) user.user_type += ' (god)'

				user.last_login = moment(user.last_login).fromNow()
				user.last_access = moment(user.last_access).fromNow()

				this.users.push(user)
			}
		})
	}

	openUser(user) {
		this.router.navigate(['/admin/users', user._id, 'profile'])
	}
}