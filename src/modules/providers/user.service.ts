import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { APIService } from './api.service';

export class User {
	_id: String
	email: String
	name: String
	created: String
	lastLogin: String
	protected: boolean
	blocked: boolean
	no_unspent_criminal: boolean

	constructor(data) {
		this._id = data._id;
		this.email = data.email;
		this.name = data.name;
		this.created = data.created;
		this.lastLogin = data.last_login;
		this.blocked = data.blocked;
		this.protected = data.protected;
		this.no_unspent_criminal = data.no_unspent_criminal;
	}
}

export class UserPermission {
	admin: boolean
	superadmin: boolean
	supervisor: boolean
	mechanic: boolean

	constructor(data: any = null) {
		this.admin = false
		this.superadmin = false
		this.supervisor = false
		this.mechanic = false

		if (!data) return;

		for (var privilege of data) {
			switch (privilege.type) {
				case 'mechanic':
					this.supervisor = true
					this.mechanic = true
					break
				case 'superadmin':
					this.superadmin = true
				case 'admin':
					this.admin = true
				case 'supervisor':
					this.supervisor = true
			}
		}
	}
}

@Injectable()
export class UserService {
	private loggedIn = false;
	private user: User;
	permissions: UserPermission

	constructor(private api: APIService, private router: Router) {
		this.user = null;
		this.permissions = new UserPermission;

		if (api.getToken() && api.getToken().length > 0) {
			this.loggedIn = true;
		}
	}

	fetchUser(): Promise<User> {
		return new Promise((resolve, reject) => {
			if (this.user != null) return resolve(this.user)

			this.api.get('/user').subscribe(res => {
				this.fetchUserPrivileges().then(() => {
					this.loggedIn = true
					this.user = new User(res.json())

					resolve(this.user)
				}, reject)
			}, err => {
				this.logout()
				reject(err)
			})
		})
	}

	getUser(): User {
		return this.user
	}

	fetchUserPrivileges(): Promise<UserPermission> {
		return new Promise((resolve, reject) => {
			this.api.get("/user/privileges").subscribe(res => {
				this.permissions = new UserPermission(res.json())
				return resolve(this.permissions)
			}, reject)
		})
	}

	logout() {
		this.api.logout()

		this.user = null;
		this.loggedIn = false;
	}

	isLoggedIn() {
		return this.loggedIn;
	}
}