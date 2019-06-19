import { ViewChild, Component, NgZone } from '@angular/core'
import { FileUploader } from 'ng2-file-upload/ng2-file-upload'
import { APIService } from '../providers/api.service'
import { UserService } from '../providers/user.service'
import * as moment from 'moment/moment'
import { ModalDirective, CollapseDirective } from 'ng2-bootstrap';

declare var Stripe: any;

@Component({
    selector: 'membership',
    	templateUrl: './membership.pug',

})
export class MembershipComponent {
    @ViewChild('checkCodeHelp', {static: true}) checkCodeHelp: ModalDirective;
    uploader_front: FileUploader
    uploader_back: FileUploader
    uploader_cbt: FileUploader
    uploader_selfie: FileUploader
    uploader_passport: FileUploader
    uploader_utility: FileUploader

    membership: any = {
        licenses: [],
        dob: moment().add("years", -21).format('YYYY-MM-DD')
    }
    garages: any = []
    card: any = {}

    status = {
        message: "",
        license_front: false,
        license_back: false,
        license_cbt: false,
        license_selfie: false,
        license_passport: false,
        utility_bill: false
    }

    constructor(private api: APIService, private zone: NgZone, private userService: UserService) {
        api.get('/user/license').subscribe(res => {
            let d = res.json()
            this.status.license_front = d.front
            this.status.license_back = d.back
            this.status.license_cbt = d.cbt
            this.status.license_selfie = d.selfie
            this.status.license_passport = d.passport
            this.status.utility_bill = d.utility_bill
        })

        api.get('/user/membership').subscribe(res => {
            let d = res.json()

            api.get('/garages').subscribe(res => {
                this.garages = res.json()
                if (!d.work_city || d.work_city == "") d.work_city = this.garages[0].name
            })

            if (d.dob == "0001-01-01T00:00:00Z") d.dob = this.formatDate(moment().toISOString())
            else d.dob = this.formatDate(d.dob)

            d.driver_license_expiry = this.formatDate(d.driver_license_expiry)
            d.cbt_expiry = this.formatDate(d.cbt_expiry)

            this.membership = d
        })

        this.initUploaders()
    }

    formatDate(date: string): string {
        return moment(date).format('DD/MM/YYYY')
    }

    initUploaders() {
        this.uploader_cbt = new FileUploader({
            url: this.api.getEndpoint('/user/license/cbt'),
            authToken: this.api.getToken()
        })
        this.uploader_front = new FileUploader({
            url: this.api.getEndpoint('/user/license/front'),
            authToken: this.api.getToken(),
            allowedMimeType: ["image/jpeg", "image/png"]
        })
        this.uploader_back = new FileUploader({
            url: this.api.getEndpoint('/user/license/back'),
            authToken: this.api.getToken(),
            allowedMimeType: ["image/jpeg", "image/png"]
        })
        this.uploader_selfie = new FileUploader({
            url: this.api.getEndpoint('/user/license/selfie'),
            authToken: this.api.getToken(),
            allowedMimeType: ["image/jpeg", "image/png"]
        })
        this.uploader_passport = new FileUploader({
            url: this.api.getEndpoint('/user/license/passport'),
            authToken: this.api.getToken(),
            allowedMimeType: ["image/jpeg", "image/png"]
        })
        this.uploader_utility = new FileUploader({
            url: this.api.getEndpoint('/user/license/utility'),
            authToken: this.api.getToken(),
            allowedMimeType: ["image/jpeg", "image/png"]
        })

        this.uploader_cbt.onWhenAddingFileFailed = this.onWhenAddingFileFailed(this.uploader_cbt)
        this.uploader_cbt.onAfterAddingFile = this.onAfterAddingFile(this.uploader_cbt)

        this.uploader_front.onWhenAddingFileFailed = this.onWhenAddingFileFailed(this.uploader_front)
        this.uploader_front.onAfterAddingFile = this.onAfterAddingFile(this.uploader_front)

        this.uploader_back.onWhenAddingFileFailed = this.onWhenAddingFileFailed(this.uploader_back)
        this.uploader_back.onAfterAddingFile = this.onAfterAddingFile(this.uploader_back)

        this.uploader_selfie.onWhenAddingFileFailed = this.onWhenAddingFileFailed(this.uploader_selfie)
        this.uploader_selfie.onAfterAddingFile = this.onAfterAddingFile(this.uploader_selfie)

        this.uploader_passport.onWhenAddingFileFailed = this.onWhenAddingFileFailed(this.uploader_passport)
        this.uploader_passport.onAfterAddingFile = this.onAfterAddingFile(this.uploader_passport)

        this.uploader_utility.onWhenAddingFileFailed = this.onWhenAddingFileFailed(this.uploader_utility)
        this.uploader_utility.onAfterAddingFile = this.onAfterAddingFile(this.uploader_utility)
    }

    getDate(d) {
        let date = moment(d, 'DD/MM/YYYY')
        if (date.isValid() == false) return null;

        return date.toDate()
    }

    saveProgress(cb = function () { }) {
        var membership = JSON.parse(JSON.stringify(this.membership))
        membership.dob = this.getDate(membership.dob)
        membership.cbt_expiry = this.getDate(membership.cbt_expiry)
        membership.driver_license_expiry = this.getDate(membership.driver_license_expiry)

        this.status.message = "Saving Application"
        this.api.post('/user/membership', membership).subscribe(res => {
            this.status.message = "Application Saved"
            cb();
        }, err => {
            let data = err.json()
            if (data && data.error || data && data.errors) {
                this.status.message = data.error;
                if (data.errors) {
                    this.status.message = data.errors.join(', ');
                }
            } else {
                this.status.message = "Unknown Error"
            }
        })
    }

    submitApplication() {
        this.saveProgress(() => {
            this.api.post('/user/membership/submit', null).subscribe(res => {
                this.status.message = "Application Submitted for review"
                this.membership.submitted = true
            }, err => {
                let data = err.json()
                if (data && data.error || data && data.errors) {
                    this.status.message = 'Error: ' + data.error;
                    if (data.errors) {
                        this.status.message = 'Error: ' + data.errors.join(', ');
                    }
                } else {
                    this.status.message = "Unknown Error"
                }
            })
        })
    }

    uploadIf(uploader) {
        uploader.error = null;

        if (uploader.queue.length == 0) return;
        if (uploader.queue[0].isSuccess) return;
        if (uploader.queue[0].isUploading) return;

        uploader.queue[0].upload()
    }
    uploadLicenses() {
        this.uploadIf(this.uploader_front)
        this.uploadIf(this.uploader_back)
        this.uploadIf(this.uploader_cbt)
        this.uploadIf(this.uploader_selfie)
        this.uploadIf(this.uploader_passport)
        this.uploadIf(this.uploader_utility)
    }

    resetUpload() {
        this.initUploaders()
        this.status.license_back = false
        this.status.license_front = false
        this.status.license_cbt = false
        this.status.license_selfie = false
        this.status.license_passport = false
        this.status.utility_bill = false
    }

    showCheckCodeHelp() {
        this.checkCodeHelp.show();
    }

    onAfterAddingFile(uploader) {
        return function () {
            uploader.error = null
        }
    }
    onWhenAddingFileFailed(uploader) {
        return function () {
            uploader.error = "File must be an image"
        }
    }
}