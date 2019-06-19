import { Component, ChangeDetectorRef, ViewChild } from '@angular/core'
import { Router } from '@angular/router'
import { APIService } from '../../providers/api.service'
import * as moment from 'moment/moment'
import { ModalDirective } from 'ng2-bootstrap'

@Component({
    selector: 'admin-memberships',
    	templateUrl: './all.pug',

})
export class MembershipsComponent {
    @ViewChild('membershipInfoModal', {static: true}) membershipInfoModal: ModalDirective

    stats: any
    members: any
    membership: any
    state: string = "uncontacted"
    sortName = false

    constructor(private api: APIService, private router: Router, private changeDetector: ChangeDetectorRef) {
        if (localStorage["admin_memberships_state"]) {
            this.state = localStorage["admin_memberships_state"]
        }
    }

    ngOnInit() {
        this.refreshMemberships()
    }

    refreshMemberships() {
        this.members = []

        this.api.get('/admin/memberships/stats').subscribe(res => {
            this.stats = res.json()
            this.changeDetector.detectChanges()
        })

        this.api.get('/admin/memberships?state=' + this.state).subscribe(res => {
            this.members = res.json()

            for (var user of this.members) {
                if (user.memberships && user.memberships.length > 0) {
                    user.membership = user.memberships[0];
                }

                if (this.state != 'new') {
                    if (!user.membership) continue;

                    let date = moment(user.membership.interview_date);
                    if (!date || date.isValid() == false) {
                        user.membership.interview_date = ''
                        user.membership.interview_time = '12:00'
                        continue;
                    }

                    user.membership.interview_date = date.format('DD/MM/YYYY');
                    user.membership.interview_time = date.format('HH:mm');
                }
            }

            if (!this.sortName) return;
            this.members.sort((a, b) => {
                if (a.name > b.name) return 1;
                if (a.name < b.name) return -1;
                return 0;
            })

            this.changeDetector.detectChanges()
        })
    }

    saveInterviewDate(user) {
        user.membership.has_error = false;

        let interview_date = moment(user.membership.interview_date + " " + user.membership.interview_time, 'DD/MM/YYYY HH:mm').toDate()

        let now = new Date
        if (interview_date.getTime() < now.getTime()) {
            user.membership.has_error = true;

            return
        }

        this.api.post("/admin/users/" + user._id + "/membership/interview", {
            interview_date: interview_date
        }).subscribe(() => {
            this.refreshMemberships()
        })
    }

    setRating(user, rating) {
        this.api.post('/admin/users/' + user._id + '/membership/rating', {
            rating: rating
        }).subscribe(res => {
            user.membership.rating = rating;
        })
    }

    openUser(user) {
        // if (this.state == 'new') {
        //     // open modal
        //     if (!user.membership) {
        //         return alert('No membership form!');
        //     }
        //     this.membership = user.membership

        //     this.membershipInfoModal.show()
        //     return
        // }

        this.router.navigate(['/admin/users', user._id, 'membership'])
    }

    setState(state: string) {
        this.state = state
        localStorage["admin_memberships_state"] = state

        this.refreshMemberships()
    }

    updateSort() {
        this.sortName = !this.sortName
        this.refreshMemberships()
    }
}