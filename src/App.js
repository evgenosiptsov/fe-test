import React, { Component } from 'react';
import {
	Map,
	TileLayer,
	GeoJSON,
	LayersControl,
	Popup,
	Tooltip
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import farm from './data/farm.json';
import crops from './data/crops.json';
import { SimpleComponent } from './components'
import {
	getColor,
	fitBounds,
	getYields,
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
		const { center, zoom } = fitBounds(fields, { width, height });
		const { forecasts, greatestTotalYield } = makeForecasts(fields, crops);
		const recommendations = makeRecommendations(fields, crops);
		const selectedField = {};
		const plantedFields = {};
		const yields = getYields(fields, plantedFields);
		
		console.log(recommendations);
		
		this.state = {
			fields,
			width,
			height,
			center,
			zoom,
			plantedFields,
			selectedField,
			yields,
			forecasts,
			recommendations,
			greatestTotalYield,
		};
	}
	
	onSelectField(field) {
		const { name } = field;
		const { plantedFields } = this.state;
		const crop = plantedFields[name] || {};
		const selectedField = { ...field, ...{ crop } };
		
		this.setState({
			selectedField,
		})
	}

	onPlantCrop(field, crop) {
		const { fields } = this.state;
		let yields;
		let plantedFields = { ...this.state.plantedFields };
		
		plantedFields[field.name] = crop;
		yields = getYields(fields, plantedFields);
		
		this.setState({
			plantedFields,
			yields,
		})
	}

	onRemoveCrop(field) {
		const { fields } = this.state;
		let plantedFields = { ...this.state.plantedFields };
		delete plantedFields[field.name];
		
		const yields = getYields(fields, plantedFields);
		
		this.setState({
			plantedFields,
			yields,
		})
	}

	render() {
		const { width, height, center, zoom, plantedFields, selectedField, fields, yields, forecasts, recommendations, greatestTotalYield } = this.state;
		const totalYield = Object.keys(yields).reduce((totalYield, fieldName) =>
			totalYield + yields[fieldName], 0
		);
	
	    return (
	        <Map
	            style={{ width, height }}
	            center={center}
	            zoom={zoom}
	        >
				<LayersControl position="bottomright" collapsed={true}>
					
                    <SimpleComponent position="topright" className="leaflet-control-actions">
                        <div>
                            <h2>{farm.name}</h2>
                            <div> Your total yield is {totalYield.toFixed(2)} tonnes </div>
                            <div> Your greatest possible yield is {greatestTotalYield.toFixed(2)} tonnes </div>
                            { !Object.keys(selectedField).length ?
                                <div> <small>Hover over your fields</small></div>
	                            :
                                <div>
                                    <h3> {selectedField.name} </h3>
                                    <div> { selectedField.crop.name ? `${selectedField.crop.name} is cropped` : null} </div>
                                    <small>Click on your field for actions</small>
                                </div>
                            }
                        </div>
                    </SimpleComponent>

                    {fields.map(field => {

                        return (
                            <Overlay name={field.name} key={field.name} checked>
	                            <GeoJSON
                                    key={field.name}
                                    data={field.boundary}
                                    onMouseOut={() => this.setState({ selectedField: {} })}
                                    onMouseOver={() => this.onSelectField(field)}
                                    style={() => {
	                                    const fillColor = getColor(yields[field.name]);
	                                    return {
		                                    ...(selectedField.name === field.name ? SELECTED_FIELD_STYLE : DEFAULT_FIELD_STYLE),
		                                    fillColor,
	                                    }
                                    }}
                                >
		                            { !!yields[field.name] &&
			                            <Tooltip permanent className="leaflet-tooltip-field">
	                                        <h3> {yields[field.name].toFixed(2)} </h3>
			                            </Tooltip>
		                            }
		                            
		                            <Popup>
                                        <div>
                                            <h3> {field.name} <small>{field.hectares} hectares</small></h3>
                                            { !!plantedFields[field.name] &&
                                                <div className="crops--selected">
                                                    <div className="crops-item">
                                                        <button className="crops-item-button" onClick={() => this.onRemoveCrop(field)} >
                                                            Remove {plantedFields[field.name].name}
                                                        </button>
	                                                    <div className="crops-item-text">
		                                                    ${plantedFields[field.name].price_per_tonne} / tonne,
		                                                    {plantedFields[field.name].expected_yield} expected yield per hectare
	                                                    </div>
                                                    </div>
                                                    <hr/>
                                                </div>
                                            }
											
	                                        { !plantedFields[field.name] && <div> Select crop: </div> }
	                                        { !!plantedFields[field.name] && <div> Replace the crop: </div> }
	                                        
                                            <div className="crops">
                                                {crops.map(crop => {
	                                                let classNames = ['crops-item-button'];
	                                                const possibleYield = forecasts[field.name][crop.name];
	                                                const backgroundColor = getColor(possibleYield);
	                                                
	                                                if (plantedFields[field.name] && plantedFields[field.name].name === crop.name) {
														classNames.push('crops-item-button--disabled');
	                                                }
	                                                
	                                                return (
	                                                    <div className="crops-item" key={crop.name}>
                                                            <button
                                                                className={classNames.join(' ')}
                                                                style={{ backgroundColor }}
                                                                onClick={() => this.onPlantCrop(field, crop)}
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
                            {Object.keys(recommendations).filter(cropName =>
                                recommendations[cropName].name !== plantedFields[recommendations[cropName].name]
                            ).filter((cropName, recommendationId) =>
                                recommendationId < 4
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
