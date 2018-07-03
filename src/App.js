import React, { Component } from 'react';
import {
	Map,
	TileLayer,
	GeoJSON,
	LayersControl,
	Popup,
	Tooltip,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import farm from './data/farm.json';
import crops from './data/crops.json';
import { SimpleComponent } from './components'
import {
	getColor,
	fitBounds,
	makeForecasts,
	makeRecommendations,
} from './lib/fields'
import {
	DEFAULT_FIELD_STYLE,
	SELECTED_FIELD_STYLE
} from './constants'


const { Overlay } = LayersControl;

class App extends Component {
	
	constructor(props) {
		super(props);
		const { fields } = farm;
		const { innerWidth: width, innerHeight: height } = window;
		const { bounds } = fitBounds(fields, { width, height });
		const { forecasts, greatestTotalYield } = makeForecasts(fields, crops);
		const recommendations = makeRecommendations(fields, crops);
		const selectedField = {};
		
		this.state = {
			fields,
			width,
			height,
			selectedField,
			forecasts,
			recommendations,
			greatestTotalYield,
			bounds,
		};
		
		this.mapRef = React.createRef();
	}
	
	onChangeFocus(name, disable = false) {
		const fields = this.state.fields.map(field => {
			if (name === field.name) {
				return { ...field, ...{ selected: !disable } };
			} else {
				return { ...field, ...{ selected: false } };
			}
		});
		
		this.setState({
			fields,
		})
	}
	
	onChangeCrop(name, crop = null) {
		const fields = this.state.fields.map(field =>
			(name !== field.name && field) || { ...field, ...{ crop } }
		);
		
		this.setState({
			fields,
		})
	}
	
	
	render() {
		const { width, height, bounds, fields, forecasts, recommendations, greatestTotalYield } = this.state;
		const totalYield = fields.reduce((totalYield, field) => totalYield + ((field.crop && forecasts[field.name][field.crop.name]) || 0), 0);
		const selectedField = fields.filter(field => field.selected)[0];
		
		return (
			<Map
				style={{ width, height }}
				bounds={bounds}
				ref={this.mapRef}
			>
				<LayersControl position="bottomright" collapsed={true}>
					
					<SimpleComponent position="topright" className="leaflet-control-actions">
						<div>
							<h2>{farm.name}</h2>
							<div> Your total yield is {totalYield.toFixed(2)} tonnes </div>
							<div> Your greatest possible yield is {greatestTotalYield.toFixed(2)} tonnes </div>
							{ !selectedField ?
								<div> <small>Hover over your fields</small></div>
								:
								<div>
									<h3> {selectedField.name} </h3>
									<div> { selectedField.crop && selectedField.crop.name ? `${selectedField.crop.name} is cropped` : null} </div>
									<small>Click on your field for actions</small>
								</div>
							}
						</div>
					</SimpleComponent>
					
					{fields.map(field => {
						return (
							<Overlay name={field.name} key={field.name} ref={this.boundLayer} checked>
								<GeoJSON
									data={field.boundary}
									onMouseOut={() => this.onChangeFocus(field.name, true)}
									onMouseOver={() => this.onChangeFocus(field.name)}
									style={() => {
										const expectedYield = (field.crop && forecasts[field.name][field.crop.name]) || 0;
										const fillColor = getColor(expectedYield);
										return {
											...(selectedField && selectedField.name === field.name ? SELECTED_FIELD_STYLE : DEFAULT_FIELD_STYLE),
											fillColor,
										}
									}}
								>
									{ !!field.crop &&
									<Tooltip permanent className="leaflet-tooltip-field">
										<h3> {forecasts[field.name][field.crop.name].toFixed(2)} </h3>
									</Tooltip>
									}
									
									<Popup>
										<div>
											<h3> {field.name} <small>{field.hectares} hectares</small></h3>
											{ !!field.crop &&
											<div className="crops--selected">
												<div className="crops-item">
													<button className="crops-item-button" onClick={() => this.onChangeCrop(field.name)}>
														Remove {field.crop.name}
													</button>
													<div className="crops-item-text">
														${field.crop.price_per_tonne} / tonne,
														{field.crop.expected_yield} expected yield per hectare
													</div>
												</div>
												<hr/>
											</div>
											}
											
											{ !field.crop && <div> Select crop: </div> }
											{ !!field.crop && <div> Replace the crop: </div> }
											
											<div className="crops">
												{crops.map(crop => {
													let classNames = ['crops-item-button'];
													const possibleYield = forecasts[field.name][crop.name];
													const backgroundColor = getColor(possibleYield);
													
													if (field.crop && field.crop.name === crop.name) {
														classNames.push('crops-item-button--disabled');
													}
													
													return (
														<div className="crops-item" key={crop.name}>
															<button
																className={classNames.join(' ')}
																style={{ backgroundColor }}
																onClick={() => this.onChangeCrop(field.name, crop)}
															>
																{`Get ${possibleYield.toFixed(2)} tonnes`}
															</button>
															<div className="crops-item-text">
																{crop.name} (${crop.price_per_tonne} / tonne)
															</div>
														</div>
													);
												})}
											</div>
										</div>
									</Popup>
								</GeoJSON>
							</Overlay>
						)
					})}
					
					<SimpleComponent position="bottomright" className="leaflet-control-actions">
						<div>
							<h3>Yields</h3>
							{[0, 10, 20, 50, 100, 200, 500, 1000].reverse().map((grade, index) => {
								const backgroundColor = getColor(grade);
								const style = { ...{backgroundColor}, display: 'inline-block', width: 20 }
								
								return <div key={index}> <span { ...{style} }> &nbsp;</span> {grade} + </div>
							})}
						</div>
					</SimpleComponent>
					
					
					<SimpleComponent position="bottomleft" className="leaflet-control-actions">
						<div>
							<h3>Recommendations for crops</h3>
							{Object.keys(recommendations).filter(cropName => true).filter((cropName, recommendationId) =>
								fields.filter(field => field.crop).map(field => field.crop.name).indexOf(cropName) < 0
							).map(cropName => {
								const recommendation = recommendations[cropName];
								const backgroundColor = getColor(recommendation.expected);
								const style = { ...{backgroundColor}, display: 'inline-block', padding: '0px 5px', color: 'white' };
								
								return (
									<div key={cropName}>
										<span { ...{style} }> {recommendation.expected.toFixed(2)} </span> {cropName} best for {recommendation.name}
									</div>)
							})}
						</div>
					</SimpleComponent>
					
					<TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
				
				</LayersControl>
			</Map>
		);
	}
}

export default App;
