import React, { Component } from 'react';
import { Map, TileLayer, GeoJSON, LayersControl, Popup, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import { DEFAULT_FIELD_STYLE, SELECTED_FIELD_STYLE } from './constants'
import { SimpleComponent } from './components'
import { getColor, fitBounds, getYieldOfField, getYields} from './lib/fields'
import farm from './data/farm.json';
import crops from './data/crops.json';

const { Overlay } = LayersControl;

class App extends Component {
  
  constructor(props) {
    super(props);
    const { fields } = farm;
    const { innerWidth: width, innerHeight: height } = window;
    const { center, zoom } = fitBounds(fields, {width, height});
    const forecasts = {};
    const selectedField = {};
    const plantedFields = {};
    const yields = getYields(fields, plantedFields);
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
      const { fields } = this.state;
      let plantedFields = { ... this.state.plantedFields };
      plantedFields[field.name] = crop

      const yields = getYields(fields, plantedFields);

      this.setState({
          plantedFields,
          yields
      })
  }

  onRemoveCrop(field) {
      const { fields } = this.state;
      let plantedFields = { ... this.state.plantedFields };
      delete plantedFields[field.name];

      const yields = getYields(fields, plantedFields);

      this.setState({
          plantedFields,
          yields,
      })
  }

  render() {
    const { width, height, center, zoom, plantedFields, selectedField, fields, yields } = this.state;

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
                    <h2>{farm.name}</h2>

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
            
              {fields.map(field => {

                  const crop = plantedFields[field.name];

                  return (
                      <Overlay name={field.name} key={field.name} checked={true}>
                        <GeoJSON
                            style={() => {
                                const fillColor = getColor(yields[field.name]);
                                return {...(selectedField.name === field.name ?  SELECTED_FIELD_STYLE : DEFAULT_FIELD_STYLE), fillColor}
                            }}
                            key={field.name}
                            data={field.boundary}
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
                                {yields[field.name] ? Math.round(yields[field.name]) : null}
                            </h3>
                          </Tooltip>
                            <Popup
                                position="bottom"
                            >
                                <div>
                                    <h3>
                                        {field.name}
                                    </h3>
                                    { plantedFields[field.name] ?
                                        <div className="crops--selected">
                                            <div className="crops-item">
                                                <button className="crops-item-button" onClick={() => this.onRemoveCrop(field)}>
                                                    Remove {plantedFields[field.name].name}
                                                </button>
                                            </div>
                                            <hr/>
                                            Replace crop with:
                                        </div>
                                            :
                                        <div>
                                            Select crop:
                                        </div>
                                    }

                                    <div className="crops">
                                    {crops.map((crop) => {
                                        return (
                                            <div className="crops-item">
                                                <button className="crops-item-button" onClick={() => this.onPlantCrop(field, crop)}>
                                                    Add
                                                </button>
                                                <div className="crops-item-text">
                                                    {crop.name}
                                                </div>
                                            </div>
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
                <div>
                    <h3>Yields</h3>
                    {[0, 10, 20, 50, 100, 200, 500, 1000].reverse().map((grade, index) => {
                        const backgroundColor = getColor(grade)

                        return (
                            <div>
                                <span style={{ backgroundColor, display: 'inline-block', width: 20 }}> &nbsp; </span> {grade} +
                            </div>
                        )
                    })}
                </div>

            </SimpleComponent>

            <SimpleComponent position="bottomleft" className="leaflet-control-actions">
                <div>
                    <h3>Forecasts</h3>
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
