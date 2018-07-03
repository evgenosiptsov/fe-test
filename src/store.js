import {observable, action, decorate, reaction} from 'mobx';
import {FARM_ENDPOINT, CROPS_ENDPOINT} from './constants/index'
import axios from 'axios'

class HummingbirdModel {
	fields = [];
	crops = [];
	title = "";
	
	constructor() {
		this.subscribeStoreToServer();
	}
	
	subscribeStoreToServer() {
		reaction(
			() => this.fields.map(field => `${field.name} ${field.crop}`),
			fields => { console.log('reactions', fields); },
		);
	}
	
	fetchFromServer() {
		let that = this;
		axios.get(FARM_ENDPOINT).then(({data: farm}) => farm).then((farm) => {
			return axios.get(CROPS_ENDPOINT).then(({data: crops}) => crops).then((crops) => {
				const { name: title, fields } = farm;
				that.title = title;
				that.fields = fields.map(field => ({ ...field, ...{ selected: false, crop: null }}));
				that.crops = crops;
			})
		});
	}
}

export default decorate(HummingbirdModel, {
	fields: observable,
	crops: observable,
	title: observable,
	fetch: action,
});