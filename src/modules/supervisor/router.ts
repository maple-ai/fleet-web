import { Component } from '@angular/core';
import { Routes } from '@angular/router';

import { BikesComponent } from '../admin/bikes/index';
import { BikeMaintenanceComponent } from '../admin/bikes/maintenance'
import { BikeShiftsComponent } from '../admin/bikes/shifts'
import { GaragesComponent } from '../admin/garages/index';
import { MembershipsComponent } from '../admin/memberships/component'

import { UsersComponent, AdminUserComponent } from '../admin/users/index';
import { UserMembershipComponent } from '../admin/users/membership'
import { UserShiftsComponent } from '../admin/users/shifts'
import { UserWagesComponent } from '../admin/users/wages'

import { AdminUserResolve } from '../admin/users/resolve.service'
import { AdminService } from '../admin/admin.service'

import { ShiftsComponent } from '../admin/shifts/calendar'
import { ShiftComponent } from '../admin/shifts/shift'

import { UserService, User } from '../providers/user.service'

import { SupervisorGuard } from './guard'

@Component({
	selector: 'supervisor-router',
	templateUrl: './navigation.pug',
	providers: [AdminService]
}) export class SupervisorRouter {
	user: User

	constructor(private userService: UserService, private adminService: AdminService) {
		this.user = userService.getUser()
		adminService.canEdit = false;
	}
}

export const SupervisorRoutes: Routes = [{
	path: 'supervisor',
	component: SupervisorRouter,
	canActivate: [SupervisorGuard],
	children: [
		{ path: 'bikes', component: BikesComponent },
		{
			path: 'bikes/:bike_id', children: [
				{ path: 'shifts', component: BikeShiftsComponent },
				{ path: 'maintenance', component: BikeMaintenanceComponent }
			]
		},
		{ path: 'garages', component: GaragesComponent },
		{ path: 'users', component: UsersComponent },
		{
			path: 'users/:user_id', component: AdminUserComponent, resolve: { data: AdminUserResolve }, children: [
				{ path: '', redirectTo: './membership', pathMatch: 'full' },
				{ path: 'membership', component: UserMembershipComponent },
				{ path: 'shifts', component: UserShiftsComponent },
				{ path: 'wages', component: UserWagesComponent }
			]
		},
		{
			path: 'shifts', children: [
				{ path: '', component: ShiftsComponent },
				{ path: ':shift_id', component: ShiftComponent }
			]
		}
	]
}];