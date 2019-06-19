import {Component} from '@angular/core'
import {APIService} from '../providers/api.service'
import {ActivatedRoute, Router} from '@angular/router'

@Component({
		template:`
<section class="bg-faded"><div class="container">
	<br/>
	<div class="row"><div class="col-sm-6 offset-sm-3">
		<form>
			<div class="form-group">
				<p>{{ status }}</p>
			</div>
			<div class="form-group">
				<label>New Password</label>
				<input type="password" class="form-control" [(ngModel)]="password" name="password" />
			</div>
			<div class="form-group">
				<button class="btn btn-primary" (click)="reset()">Reset Password</button>
			</div>
		</form>
	</div></div>
	<br/>
</div></section>
`
})
export class PasswordResetComponent {
	password = ""
	status = ""

	constructor(private api: APIService, private route: ActivatedRoute, private router: Router) {}

	reset() {
		this.api.post('/auth/reset', {
			token: this.route.snapshot.params["token"],
			password: this.password
		}).subscribe(res => {
			this.status = "Password Updated. Please log in."
			this.password = ""
			this.router.navigate(['/'])
		}, err => {
			this.status = "Password cannot be updated"
			let data = err.json()
			if (data && data.error) {
				this.status += ": " + data.error
			}
		})
	}
}