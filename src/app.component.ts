import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { SiteDeploymentService } from './modules/providers/deployment';

@Component({
  selector: 'app-root',
  	template: '<router-outlet></router-outlet>',
})
export class AppComponent implements OnInit {
  constructor(private titleService: Title,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private deployment: SiteDeploymentService) {
  }

  ngOnInit(): void {
    this.router.events.subscribe(event => {
      if (!(event instanceof NavigationEnd)) return;

      let route = this.activatedRoute;
      while (route.firstChild) route = route.firstChild;

      if (route.outlet !== 'primary') return;

      this.titleService.setTitle(route.snapshot.data['title'] ? `${route.snapshot.data['title']} - ${this.deployment.getSiteName()}` : this.deployment.getSiteName());
    })
  }
}
