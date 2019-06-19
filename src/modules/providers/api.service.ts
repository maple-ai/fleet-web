import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
declare var SF_API;

@Injectable()
export class APIService {
	private endpoint: string
	private authToken: string

	constructor(private http: Http) {
		this.endpoint = "http://localhost:2000"
		if (typeof SF_API == 'string') {
			this.endpoint = SF_API;
		}

		this.authToken = localStorage.getItem("sf_token")
	}

	getHeaders(json: boolean = true) {
		let headers = new Headers({
			'Accept': 'application/json',
			'Authorization': this.authToken || ''
		});

		if (json) {
			headers.append('Content-Type', 'application/json');
		}

		return { headers: headers }
	}

	setToken(token: string) {
		localStorage.setItem("sf_token", token)
		this.authToken = token
	}
	getToken() {
		return this.authToken
	}

	logout() {
		localStorage.removeItem("sf_token")
		this.authToken = ""
	}

	getEndpoint(url: string): string {
		if (url.startsWith('http')) {
			return url;
		}

		return this.endpoint + url;
	}

	getHTTPAuth(url: string): string {
		return this.getEndpoint(url) + '?authorization=' + encodeURIComponent(this.getToken())
	}

	// HTTP Methods

	get(url): Observable<Response> {
		return this.http.get(this.getEndpoint(url), this.getHeaders(false));
	}

	post(url, body): Observable<Response> {
		return this.http.post(this.getEndpoint(url), JSON.stringify(body), this.getHeaders());
	}

	put(url, body): Observable<Response> {
		return this.http.put(this.getEndpoint(url), JSON.stringify(body), this.getHeaders());
	}

	delete(url): Observable<Response> {
		return this.http.delete(this.getEndpoint(url), this.getHeaders(false));
	}
}