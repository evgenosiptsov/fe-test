import React, { Component } from 'react';
import { Map, TileLayer, LayersControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { SimpleComponent, Field } from './components'
import { getColor } from './lib/fields'

const { Overlay } = LayersControl;

class App extends Component {

	constructor(props) {
		super(props);
		
		const { store } = props;
		const { innerWidth: width, innerHeight: height } = window;
		
		store.fetchFromServer();
		
		this.state = {
			width,
			height,
		};
	}
	
	render() {
		const { width, height } = this.state;
		const { store } = this.props;
		const { fetched, errored, fields, bounds, title, forecasts, recommendations, potential } = store;
		
		const totalYield = fields.reduce((totalYield, field) => totalYield + ((field.crop && forecasts[field.name][field.crop.name]) || 0), 0);
		const selectedField = fields.filter(field => field.selected)[0];
		
	    return (
	        <Map
	            style={{ width, height }}
	            bounds={bounds}
	        >
				<LayersControl position="bottomright" collapsed={true}>
					
					<SimpleComponent position="topright" className="leaflet-control-actions">
						<div>
							{ !fetched &&
							<div>
								Loading...
							</div>
							}
							
							{ errored &&
							<div>
								{errored}
							</div>
							}
							
							{ !!(fetched && !errored) &&
							<div>
								<h2>{title}</h2>
								<div> Your total yield is {totalYield.toFixed(2)} tonnes</div>
								<div> Your greatest possible yield is {potential.toFixed(2)} tonnes</div>
								{ !selectedField ?
									<div>
										<small>Hover over your fields</small>
									</div>
									:
									<div>
										<h3> {selectedField.name} </h3>
										<div> { selectedField.crop && selectedField.crop.name ? `${selectedField.crop.name} is cropped` : null} </div>
										<small>Click on your field for actions</small>
									</div>
								}
							</div>
							}
						</div>
					</SimpleComponent>
					
                    {fields.map(field => {
                    	return (
		                    <Overlay name={field.name} key={field.name} checked>
                    		    <Field store={this.props.store} field={field}>1</Field>)
		                    </Overlay>
	                    );
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
					
					
					{ !!(fetched && !errored) &&
					<SimpleComponent position="bottomleft" className="leaflet-control-actions">
						<div>
							<h3>Recommendations for crops</h3>
							{ Object.keys(recommendations).filter(cropName => true).filter((cropName, recommendationId) =>
								fields.filter(field => field.crop).map(field => field.crop.name).indexOf(cropName) < 0
							).map(cropName => {
								const recommendation = recommendations[ cropName ];
								const backgroundColor = getColor(recommendation.expected);
								const style = {
									...{backgroundColor},
									display: 'inline-block',
									padding: '0px 5px',
									color: 'white'
								};
								
								return (
									<div key={cropName}>
										<span { ...{style} }> {recommendation.expected.toFixed(2)} </span> {cropName}
										best for {recommendation.name}
									</div>)
							})}
						</div>
					</SimpleComponent>
					}
					
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
					
                </LayersControl>
	        </Map>
	    );
  }
}

export default App;
