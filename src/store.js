import axios from 'axios'
import { observable, action, decorate, reaction } from 'mobx';
import { FARM_ENDPOINT, CROPS_ENDPOINT, DEFAULT_BOUNDS } from './constants/index'
import { makeForecasts, makeRecommendations, fitBounds } from './lib/fields'

class HummingbirdModel {
	
	fields = [];
	crops = [];
	bounds = DEFAULT_BOUNDS;
	forecasts = {};
	recommendations = {};
	potential = 0;
	title = "";
	fetched = false;
	errored = null;
	
	constructor() {
		this.subscribeStoreToServer();
	}
	
	subscribeStoreToServer() {
		reaction(
			() => this.fields.map(field => `${field.name} ${field.crop}`),
			fields => { console.log('Mock for sync', fields); },
		);
	}
	
	fetchFromServer() {

		return axios.get(FARM_ENDPOINT).then(({data: farm}) => farm).then((farm) => {
			return axios.get(CROPS_ENDPOINT).then(({data: crops}) => crops).then((crops) => {

				const { name: title, fields } = farm;
				const { forecasts, potential } = makeForecasts(fields, crops);
				const recommendations = makeRecommendations(fields, crops);
				const bounds = fitBounds(fields);
				
				const state = {
					title,
					fields: fields.map(field => ({ ...field, ...{ selected: false, crop: null }})),
					crops,
					forecasts,
					potential,
					recommendations,
					bounds,
				};
				
				this.forecasts = forecasts;
				this.potential = potential;
				this.bounds = bounds;
				this.recommendations = recommendations;
				this.title = title;
				this.fields = fields;
				this.crops = crops;
				this.fetched = true;
				
				return state;
			})
		}).catch(err => {
			this.errored = err.message;
			this.fetched = true;
		});
	}
	
	changeFocus(name, disable = false) {
		this.fields = this.fields.map(field => {
			if (name === field.name) {
				return { ...field, ...{ selected: !disable } };
			} else {
				return { ...field, ...{ selected: false } };
			}
		});
	}
	
	changeCrop(name, crop = null) {
		this.fields = this.fields.map(field =>
			(name !== field.name && field) || { ...field, ...{ crop } }
		);
	}
}

export default decorate(HummingbirdModel, {
	fetched: observable,
	errored: observable,
	fields: observable,
	crops: observable,
	bounds: observable,
	title: observable,
	forecasts: observable,
	potential: observable,
	recommendations: observable,
	
	//actions with automation binding
	fetchFromServer: action.bound,
	changeCrop: action.bound,
	changeFocus: action.bound,
});