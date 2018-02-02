﻿import { Component, Inject, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { UtilsService } from '../../services/utils/utils.service';

@Component({
	selector: 'qmessages',
	templateUrl: './qmessages.component.html'
})

export class QmessagesComponent {
	public messages: any;

	public selectedQueue: string;
	public loading: boolean = false;
	public showTable: boolean = false;
	public removeQueueFlag: boolean = false;
	public selected: string;

	@Output() refresh: EventEmitter<boolean> = new EventEmitter();
	@Input() queue: string = "";
	@ViewChild('newMessage') newMessage: any;

	utilsService: UtilsService;

	constructor(utils: UtilsService) {

		this.utilsService = utils;

		this.getMessages();
	}

	ngOnChanges() {
		this.getMessages();
	}

	getMessages() {

		if (!this.queue) {
			this.showTable = false;
			return;
		}

		this.showTable = false;
		this.loading = true;
		this.utilsService.getData('api/Queues/GetMessages?queue=' + this.queue).subscribe(result => {
			this.loading = false;
			this.messages = result.json();
			this.showTable = true;
		}, error => console.error(error));
	}

	addMessage() {
		this.utilsService.postData('api/Queues/NewQueueMessage?queue=' + encodeURIComponent(this.queue) + '&message=' + encodeURIComponent(this.newMessage.nativeElement.value), null).subscribe(result => {
			this.getMessages();
			this.newMessage.nativeElement.value = '';
		}, error => console.error(error));
	}

	removeMessage(event: Event) {
		var element = (event.currentTarget as Element); //button
		var messageId: string = element.parentElement!.parentElement!.children[2]!.textContent!;

		this.selected = messageId;
	}

	deleteMessage() {
		this.utilsService.postData('api/Queues/DeleteMessage?queue=' + encodeURIComponent(this.queue) + '&messageId=' + encodeURIComponent(this.selected), null).subscribe(result => {
			this.selected = '';
			this.getMessages();
		}, error => console.error(error));
	}

	cancelDeleteMessage() {
		this.selected = '';
	}

	removeQueue(event: Event) {
		this.removeQueueFlag = true;
	}

	cancelDeleteQueue() {
		this.removeQueueFlag = false;
	}

	deleteQueue() {
		this.utilsService.postData('api/Queues/DeleteQueue?queue=' + this.queue, null).subscribe(result => {
			this.queue = "";
			this.removeQueueFlag = false;
			this.refresh.emit(true);
		}, error => console.error(error));
	}

	typingMessage(event: KeyboardEvent) {
		if (event.key == 'Enter')
			this.addMessage();
	}
}
