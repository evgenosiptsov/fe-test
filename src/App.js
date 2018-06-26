import React, { Component } from 'react';
import { Map, TileLayer, GeoJSON, LayersControl, Popup, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import { DEFAULT_FIELD_STYLE, SELECTED_FIELD_STYLE } from './constants'
import { SimpleComponent } from './components'
import { getColor, fitBounds, getYieldOfField} from './lib/fields'
import farm from './data/farm.json';
import crops from './data/crops.json';

const { Overlay } = LayersControl;

class App extends Component {
  
  constructor(props) {
    super(props);
    const { innerWidth: width, innerHeight: height } = window;
    const { center, zoom } = fitBounds(farm.fields, {width, height});
    const plantedFields = {};
    const forecasts = {};
    const selectedField = {};
    this.state = {
        width,
        height,
        center,
        zoom,
        plantedFields,
        forecasts,
        selectedField,
    };
  }

  onSelectField(field) {
      const { name } = field;
      const { plantedFields } = this.state;
      const crop = plantedFields[name] || {};

      const selectedField = { ...field, ... { crop }}

      this.setState({
          selectedField
      })
  }

  onPlantCrop(field, crop) {
      const { name } = field;
      const rel = {}

      rel[name] = crop;

      const plantedFields = { ...this.state.plantedFields, ...rel }

      this.setState({
          plantedFields,
      })
  }

  removeCrop() {

  }

  render() {
    const { width, height, center, zoom, plantedFields, selectedField } = this.state;

    return (
        <Map
          style={{ width, height }}
          center={center}
          zoom={zoom}
          ref="map"
        >
          <LayersControl position="bottomleft">
  
              <SimpleComponent position="topright" className="leaflet-control-actions">
                  <div>
                    <h2>Farmer dashborard</h2>
                      { !Object.keys(selectedField).length ?
                          <div>
                              <small>Hover over your fields</small>
                          </div> :
                          <div>
                              <h3>
                                {selectedField.name}
                              </h3>
                              <div>
                                { selectedField.crop.name ? `${selectedField.crop.name} is cropped` :  null}
                              </div>
                              <small>Click on your field for more</small>
                          </div>
                      }
                  </div>
              </SimpleComponent>
            
              {farm.fields.map(field => {
                  const { name: fieldName, boundary } = field;
                  const crop = plantedFields[fieldName];
                  const yieldOfField = getYieldOfField(field, crop);

                  return (
                      <Overlay name={field.name} key={field.name} checked={true}>
                        <GeoJSON
                            style={() => {
                                const fillColor = getColor(yieldOfField);
                                return {...(selectedField.name === field.name ?  SELECTED_FIELD_STYLE : DEFAULT_FIELD_STYLE), fillColor}
                            }}
                            key={fieldName}
                            data={boundary}
                            checked={true}
                            onMouseOut={() => this.setState({ selectedField: {}})}
                            onMouseOver={() => this.onSelectField(field)}
                        >
                          <Tooltip
                              permanent
                              direction="center"
                              className="leaflet-tooltip-field"
                          >
                            <h3>
                                {fieldName}
                            </h3>
                          </Tooltip>
                            <Popup
                                position="bottom"
                                closeButton={false}
                            >
                                <div>
                                    <h3>
                                        {fieldName}
                                    </h3>
                                    Plant crops:
                                    <div>
                                    {crops.map((crop) => {
                                        return (
                                            <button
                                                onClick={() => this.onPlantCrop(field, crop)}
                                            >
                                                {crop.name}
                                            </button>
                                        )
                                    })}
                                    </div>
                                </div>
                            </Popup>
                        </GeoJSON>
                      </Overlay>
                  )

                }
              )}
  
            <SimpleComponent position="bottomright" className="leaflet-control-actions">
              <div>Yields</div>

            </SimpleComponent>

            <SimpleComponent position="bottomleft" className="leaflet-control-actions">
                <div>
                    Forecasts:
                    {crops.map((crop) => {
                        return (
                            <div>
                                {crop.name}
                            </div>
                        )
                    })}
                </div>
            </SimpleComponent>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            
          </LayersControl>
        </Map>
    );
  }
}

export default App;
