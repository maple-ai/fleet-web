import { Component, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { APIService } from '../../providers/api.service'
import { UserPermission } from '../../providers/user.service'
import { AdminService } from '../admin.service'

@Component({
	templateUrl: './profile.pug',
 })
export class UserProfileComponent implements OnInit {
  user: any = {}
  email: string
  newPassword: string
  emailStatus: string
  nameStatus: string
  passwordStatus: string
  privilegeStatus: string
  permissions: UserPermission
  canEdit = false

  constructor(private api: APIService, private route: ActivatedRoute, private router: Router, private adminService: AdminService) {
    this.permissions = new UserPermission()
    this.canEdit = adminService.canEdit
  }

  ngOnInit() {
    let data = this.route.snapshot.parent.data["data"]

    this.user = data.user
    this.permissions = new UserPermission(data.permissions)
    this.email = data.user.email

    this.user.userType = "driver"
    if (this.permissions.superadmin) this.user.userType = "superadmin"
    else if (this.permissions.admin) this.user.userType = "admin"
    else if (this.permissions.supervisor) this.user.userType = "supervisor"
    if (this.permissions.mechanic) this.user.userType = "mechanic"
  }

  changePassword() {
    this.api.post('/admin/users/' + this.user._id + '/password', {
      password: this.newPassword
    }).subscribe(() => {
      this.newPassword = ""
      this.passwordStatus = "Password Changed"
    }, err => {
      let data = err.json()
      this.passwordStatus = "Cannot change password"
      if (data && data.error) this.passwordStatus += ": " + data.error
    })
  }

  changeEmail() {
    this.api.post('/admin/users/' + this.user._id + '/email', {
      email: this.email
    }).subscribe(() => {
      this.emailStatus = "Email Changed"
    }, err => {
      let data = err.json()
      this.emailStatus = "Cannot change email"
      if (data && data.error) this.emailStatus += ": " + data.error
    })
  }

  changeName() {
    this.api.post('/admin/users/' + this.user._id + '/name', {
      name: this.user.name
    }).subscribe(() => {
      this.nameStatus = "Name Changed"
    }, err => {
      let data = err.json()
      this.nameStatus = "Cannot change name"
      if (data && data.error) this.nameStatus += ": " + data.error
    })
  }

  setPrivilege(privilege: string) {
    this.api.put('/admin/users/' + this.user._id + '/privileges', {
      type: privilege
    }).subscribe(res => {
      this.privilegeStatus = "Permissions Updated"
      this.user.userType = privilege
    }, () => {
      this.privilegeStatus = "Permissions cannot be saved"
    })
  }

  block() {
    let url = '/admin/users/' + this.user._id + '/block'
    var promise

    if (this.user.blocked) {
      // unblock
      promise = this.api.delete(url)
    } else {
      promise = this.api.post(url, null)
    }

    promise.subscribe(res => {
      this.user.blocked = !this.user.blocked
    })
  }

  deleteUser() {
    this.api.delete('/admin/users/' + this.user._id).subscribe(res => {
      this.router.navigate(['/admin/users'])
    })
  }
}
