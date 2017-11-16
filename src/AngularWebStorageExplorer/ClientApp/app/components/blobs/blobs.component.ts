﻿import { Component, Inject, Input, ViewChild  } from '@angular/core';
import { Http, Response } from '@angular/http';


@Component({
	selector: 'blobs',
	templateUrl: './blobs.component.html'
})

export class BlobsComponent {
	forceReload: boolean;
	http: Http;
	baseUrl: string;

	@Input() container: string = "";
	@ViewChild('fileInput') fileInput: any;

	public blobs: string[];

	constructor(http: Http, @Inject('BASE_URL') baseUrl: string) {

		this.http = http;
		this.baseUrl = baseUrl;

		this.getBlobs();
	}

	ngOnChanges() {
		this.getBlobs();
	}

	getBlobs() {

		if (!this.container)
			return;

		this.http.get(this.baseUrl + 'api/Blobs/GetBlobs?container=' + this.container).subscribe(result => {
			this.blobs = result.json();
		}, error => console.error(error));
	}

	removeBlob(event: Event) {
		var element = (event.currentTarget as Element); //button
		var blob : string = element.parentElement!.parentElement!.children[2]!.textContent!;

		this.http.post(this.baseUrl + 'api/Blobs/DeleteBlob?blobUri=' + encodeURIComponent(blob), null).subscribe(result => {
			this.getBlobs();
		}, error => console.error(error));
	}

	upload() {
		var that = this;
		const fileBrowser = this.fileInput.nativeElement;
		if (fileBrowser.files && fileBrowser.files[0]) {
			const formData = new FormData();
			formData.append('files', fileBrowser.files[0]);
			const xhr = new XMLHttpRequest();
			xhr.open('POST', this.baseUrl + 'api/Blobs/UploadBlob?container=' + this.container, true);
			xhr.onload = function () {
				that.getBlobs();
			};
			xhr.send(formData);
		}
	}

	downloadBlob(event: Event) {
		var element = (event.currentTarget as Element); //button
		var blob: string = element.parentElement!.parentElement!.children[2]!.textContent!;

		var url: string = this.baseUrl + 'api/Blobs/GetBlob?blobUri=' + blob;

		debugger;

		this.http.get(url).subscribe(result => {
			debugger;

			var fileName: string = "NONAME";
			var contentDisposition: string = result.headers!.get("content-disposition")!;
			contentDisposition.split(";").forEach(token => {
				token = token.trim();
				if (token.startsWith("filename="))
					fileName = token.substr("filename=".length);
			});

			var blobFile = new Blob([result.arrayBuffer()]);
			var blobUrl = URL.createObjectURL(blobFile);

			var link = document.createElement('a');
			link.href = blobUrl;
			link.setAttribute('download', fileName);
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link); 

		}, error => console.error(error));
	}
}
