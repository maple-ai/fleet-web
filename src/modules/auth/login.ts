import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../providers/user.service';
import { APIService } from '../providers/api.service';
import { AuthGuard } from './guard';

// *** OUT OF DATE ***
/*
export const AUTH_PROVIDERS = [AuthGuard];

@Component({
	selector: 'auth-login',
		template:require('auth/auth.pug',

})
export class LoginComponent implements OnInit {
	private querySub
	user = {
		email: "",
		password: "",
		type: "existing"
	}
	status = ""
	api_url = ""

	constructor(private api: APIService, private userService: UserService, private router: Router) {
		this.api_url = api.getEndpoint('/auth/google')
	}

	ngOnInit() {
		if (this.userService.isLoggedIn()) {
			this.status = 'You are already logged in!'
		}

		this.querySub = this.router.routerState.queryParams.subscribe(params => {
			if (+params["authSuccess"] == 1) {
				this.api.setToken(params["token"])

				this.userService.getUser(true).subscribe(user => {
					this.router.navigate(['/membership'], { queryParams: {} })
				})
			}
		})
	}
	ngOnDestroy() {
		this.querySub.unsubscribe()
	}

	login() {
		this.api.post('/auth/password', this.user).subscribe(res => {
			this.api.setToken(res.json().token);
			this.userService.getUser().subscribe(user => {
				if (user == null) {
					this.status = 'Invalid Login';
					return;
				}

				this.router.navigate(['/user']);
			});

			return res;
		}, err => {
			this.status = 'Invalid Login';
		});

		this.status = ""
		this.user.password = ""
	}

	saveLogin(data) {
		console.log(data)
	}
}

@Component({
	selector: 'auth-register',
		template:require('auth/register.html'
})
export class RegisterComponent {
	status = ""
	user = {
		name: "",
		email: "",
		password: ""
	}
	passwordConfirm: ""

	constructor(private api: APIService, private userService: UserService, private router: Router) {}

	register() {
		if (this.user.password.length < 8 || this.user.password.toLowerCase() == this.user.password) {
			this.status = 'Weak Password';
			return;
		}

		if (this.user.password != this.passwordConfirm) {
			this.status = 'Passwords don\'t match';
			return;
		}

		this.api.post('/auth/register', this.user).subscribe(res => {
			this.api.setToken(res.json().token);
			this.userService.getUser().subscribe(user => {
				if (user == null) {
					this.status = 'Registration failed';
					return;
				}

				this.router.navigate(['/membership']);
			});

			return res;
		}, err => {
			let body = err.json()
			if (body.errors) {
				this.status = 'Error: ' + body.errors.join(', ');
			} else {
				this.status = 'Cannot Sign up';
			}
		});

		this.status = ""
	}
}*/