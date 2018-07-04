import React from 'react';
import { getColor } from '../lib/fields'
import { GeoJSON, Popup, Tooltip } from 'react-leaflet';
import { DEFAULT_FIELD_STYLE, SELECTED_FIELD_STYLE } from '../constants'

export default function Field(props, context) {
	const { field, store } = props;
	const { crops, forecasts } = store;
	
	return (
			<GeoJSON
				data={field.boundary}
				onMouseOut={() => store.changeFocus(field.name, true)}
				onMouseOver={() => store.changeFocus(field.name)}
				style={() => {
					const expectedYield = (field.crop && forecasts[field.name][field.crop.name]) || 0;
					const fillColor = getColor(expectedYield);
					return {
						...(field.selected ? SELECTED_FIELD_STYLE : DEFAULT_FIELD_STYLE),
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
								<button className="crops-item-button" onClick={() => store.changeCrop(field.name)}>
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
											onClick={() => store.changeCrop(field.name, crop)}
										>
											{`Get ${(possibleYield || 0).toFixed(2)} tonnes`}
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
	);
}