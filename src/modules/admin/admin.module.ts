import { Component, NgModule } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { FileUploadModule } from 'ng2-file-upload/ng2-file-upload'
import { ModalModule } from 'ng2-bootstrap'

import { User, UserService } from '../providers/user.service'

import { BikesComponent, EditBikeComponent } from './bikes/index';
import { BikeMaintenanceComponent } from './bikes/maintenance'
import { BikeShiftsComponent } from './bikes/shifts'
import { GaragesComponent, EditGarageComponent } from './garages/index';
import { MembershipsComponent } from './memberships/component'

import { UsersComponent, AdminUserComponent } from './users/index';
import { UserMembershipComponent } from './users/membership'
import { UserShiftsComponent } from './users/shifts'
import { UserProfileComponent } from './users/profile'
import { UserWagesComponent } from './users/wages'

import { AdminGuard } from './admin.guard'
import { AdminUserResolve } from './users/resolve.service'
import { AdminService } from './admin.service'

import { AdminManagementComponent } from './admins/management'
import { PayrollComponent } from './payroll/dashboard'
import { ShiftsComponent } from './shifts/calendar'
import { ShiftComponent } from './shifts/shift'
import { SiteSettingsComponent } from './settings'

@Component({
	templateUrl: './navigation.pug',
	styleUrls: ['admin.scss'],
	providers: [AdminService],
}) export class AdminRouter {
	user: User

	constructor(private userService: UserService, private adminService: AdminService) {
		this.user = userService.getUser()
		adminService.canEdit = true
	}
}

let routes = RouterModule.forChild([{
	path: 'admin',
	component: AdminRouter,
	canActivate: [AdminGuard],
	children: [
		{ path: 'memberships', component: MembershipsComponent },
		{ path: 'bikes', component: BikesComponent },
		{ path: 'bikes/new', component: EditBikeComponent },
		{
			path: 'bikes/:bike_id', children: [
				{ path: '', component: EditBikeComponent },
				{ path: 'shifts', component: BikeShiftsComponent },
				{ path: 'maintenance', component: BikeMaintenanceComponent }
			]
		},
		{ path: 'garages', component: GaragesComponent },
		{ path: 'garages/new', component: EditGarageComponent },
		{ path: 'garages/:garage_id', component: EditGarageComponent },
		{ path: 'users', component: UsersComponent },
		{
			path: 'users/:user_id', component: AdminUserComponent, resolve: { data: AdminUserResolve }, children: [
				{ path: '', redirectTo: './membership', pathMatch: 'full' },
				{ path: 'membership', component: UserMembershipComponent },
				{ path: 'shifts', component: UserShiftsComponent },
				{ path: 'wages', component: UserWagesComponent },
				{ path: 'profile', component: UserProfileComponent }
			]
		},
		{ path: 'admins', component: AdminManagementComponent },
		{ path: 'payroll', component: PayrollComponent },
		{
			path: 'shifts', children: [
				{ path: '', component: ShiftsComponent },
				{ path: ':shift_id', component: ShiftComponent }
			]
		},
		{ path: 'settings', component: SiteSettingsComponent }
	]
}]);

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		routes,
		ModalModule,
		FileUploadModule
	],
	declarations: [
		AdminRouter,
		BikesComponent,
		BikeMaintenanceComponent,
		BikeShiftsComponent,
		GaragesComponent,
		MembershipsComponent,
		UsersComponent,
		UserMembershipComponent,
		UserShiftsComponent,
		UserProfileComponent,
		UserWagesComponent,
		AdminManagementComponent,
		PayrollComponent,
		ShiftsComponent,
		ShiftComponent,
		EditBikeComponent,
		EditGarageComponent,
		AdminUserComponent,
		SiteSettingsComponent
	],
	providers: [
		AdminGuard,
		AdminUserResolve,
		AdminService,
	]
})
export class AdminModule { }