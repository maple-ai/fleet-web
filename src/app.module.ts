import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'
import { HttpModule } from '@angular/http'
import { FormsModule } from '@angular/forms'
import { BrowserModule } from '@angular/platform-browser'
import { ModalModule, CollapseModule } from 'ng2-bootstrap'
import { FileUploadModule } from 'ng2-file-upload/ng2-file-upload'

import { APIService } from './modules/providers/api.service'
import { UserService, User } from './modules/providers/user.service'

import { AppComponent } from './app.component'
import { AdminModule } from './modules/admin/admin.module'

import { MarketingRouter, MarketingRoutes } from './modules/front-page/marketing'
import { HomepageComponent, DriversComponent, ForBusinessComponent, ContactComponent } from './modules/front-page/pages'
import { PasswordResetComponent } from './modules/auth/reset'

import { AuthGuard } from './modules/auth/guard'
import { SupervisorGuard } from './modules/supervisor/guard'
import { NotFoundComponent } from './404'

import { UserRouter, UserRoutes } from './modules/user/router'
import { UserComponent } from './modules/user/user'
import { MembershipComponent } from './modules/membership/membership'
import { HelpComponent } from './modules/help/help'
import { ScheduleComponent } from './modules/schedule/schedule'
import { HistoryComponent } from './modules/schedule/history'
import { WagesComponent } from './modules/schedule/wages'

import { SupervisorRouter, SupervisorRoutes } from './modules/supervisor/router'

let routing = RouterModule.forRoot([
	...MarketingRoutes,
	...UserRoutes,
	...SupervisorRoutes,
	{ path: '**', component: NotFoundComponent }
])

@NgModule({
	imports: [
		BrowserModule,
		FormsModule,
		HttpModule,
		ModalModule.forRoot(),
		routing,
		AdminModule,
		FileUploadModule,
		CollapseModule.forRoot()
	],
	declarations: [
		AppComponent,

		MarketingRouter,
		HomepageComponent,
		DriversComponent,
		ForBusinessComponent,
		ContactComponent,
		PasswordResetComponent,

		NotFoundComponent,

		UserRouter,
		UserComponent,
		MembershipComponent,
		HelpComponent,
		ScheduleComponent,
		HistoryComponent,
		WagesComponent,

		SupervisorRouter
	],
	providers: [
		UserService,
		APIService,
		AuthGuard,
		SupervisorGuard
	],
	bootstrap: [AppComponent],
}) export class AppModule { }

