import React, { Component } from 'react';
import { Map, TileLayer, GeoJSON, LayersControl, Popup, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import { DEFAULT_FIELD_STYLE, SELECTED_FIELD_STYLE } from './constants'
import { SimpleComponent } from './components'
import { getColor, fitBounds, getFieldYield} from './lib/fields'
import farm from './data/farm.json';
import crops from './data/crops.json';

const { Overlay } = LayersControl;

class App extends Component {
  
  constructor(props) {
    super(props);
    const { innerWidth: width, innerHeight: height } = window;
    const { center, zoom } = fitBounds(farm.fields, {width, height});
    const planted = {};
    const forecasts = {};
    const selected = null;
    this.state = {
        width,
        height,
        center,
        zoom,
        planted,
        forecasts,
        selected,
    };
  }

  render() {
    const { width, height, center, zoom, planted, selected } = this.state;

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
                    <b>Overall stat</b>
                    <span>Test</span>
                  </div>
              </SimpleComponent>
            
              {farm.fields.map(field => {
                  const { name: fieldName, boundary } = field;
                  const cropName = planted[fieldName];
                  const fieldYield = getFieldYield(field, crops[cropName]);
                  const fillColor = getColor(fieldYield);
                  const style = Object.assign({}, selected === fieldName ?  SELECTED_FIELD_STYLE : DEFAULT_FIELD_STYLE, { fillColor });

                  return (
                      <Overlay name={field.name} key={field.name} checked={true}>
                        <GeoJSON
                            style={() => style}
                            key={fieldName}
                            data={boundary}
                            checked={true}
                            onMouseOut={() => this.setState({ selected: null})}
                            onMouseOver={() => this.setState({ selected: fieldName})}
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
                                    Crops:
                                    <div>
                                    {crops.map((crop) => {
                                        return (
                                            <button>
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
              <div>Legend</div>
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
