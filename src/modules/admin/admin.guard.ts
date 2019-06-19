import {Injectable} from '@angular/core'
import {CanActivate, Router,
	ActivatedRouteSnapshot,
	RouterStateSnapshot} from '@angular/router'

import {UserService} from '../providers/user.service'
import {AdminService} from './admin.service'

@Injectable()
export class AdminGuard implements CanActivate {
	constructor(private userService: UserService, private router: Router) {}

	canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
		// check user permissions
		return new Promise((resolve, reject) => {
			this.userService.fetchUser().then(() => {
				resolve(this.userService.permissions.admin)
			})
		})
	}
}