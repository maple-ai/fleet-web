import { Injectable } from '@angular/core';
import { Router, Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { APIService } from '../../providers/api.service'
import { User } from '../../providers/user.service'

import * as moment from 'moment/moment'

@Injectable()
export class AdminUserResolve implements Resolve<any> {
  constructor(private api: APIService) { }

  resolve(route: ActivatedRouteSnapshot): Promise<any> {
    let userID = route.params['user_id'];

    return new Promise((resolve, reject) => {
      this.api.get('/admin/users/' + userID).subscribe(res => {
        let data = res.json();
        let user = new User(data.user);

        user.created = moment(user.created as any).format('dddd, MMMM Do YYYY, h:mm:ss a')
        user.lastLogin = moment(user.lastLogin as any).format('dddd, MMMM Do YYYY, h:mm:ss a')

        resolve({
          user: user,
          permissions: data.permissions
        })
      }, reject)
    })
  }
}
