import { Component, OnInit } from '@angular/core';
import { Routes, Router } from '@angular/router';

import { APIService } from '../providers/api.service'
import { UserService, User, UserPermission } from '../providers/user.service';
import { UserComponent } from './user';

import { MembershipComponent } from '../membership/membership';

import { HelpComponent } from '../help/help'
import { ScheduleComponent } from '../schedule/schedule'
import { HistoryComponent } from '../schedule/history'
import { WagesComponent } from '../schedule/wages'

import { AuthGuard } from '../auth/guard'

@Component({
	templateUrl: './navigation.pug',
 })
export class UserRouter implements OnInit {
	public navbarCollapsed: boolean = true;
	user: User = null;
	hasMembership = false
	userPrivileges: UserPermission

	constructor(private userService: UserService, private api: APIService, private router: Router) { }

	ngOnInit() {
		this.user = this.userService.getUser()
		this.userPrivileges = this.userService.permissions

		this.router.events.subscribe(event => {
			this.navbarCollapsed = true
		})

		this.hasMembership = false
		this.api.get('/user/membership').subscribe(res => {
			let membership = res.json()
			this.hasMembership = membership.approved
		})
	}
}

export const UserRoutes: Routes = [{
	path: '',
	component: UserRouter,
	canActivate: [AuthGuard],
	children: [
		{ path: 'user', component: UserComponent },
		{ path: 'membership', component: MembershipComponent },
		{ path: 'help', component: HelpComponent },
		{ path: 'schedule', component: ScheduleComponent },
		{ path: 'history', component: HistoryComponent },
		{ path: 'wages', component: WagesComponent }
	]
}];