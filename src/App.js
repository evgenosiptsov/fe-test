import React, { Component } from 'react';
import { Map, TileLayer, GeoJSON, LayersControl, ScaleControl, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import { DEFAULT_FIELD_STYLE } from './constants'
import { SimpleComponent } from './components'
import { getColor, fitBounds, getFieldYield} from './lib/fields'
import farm from './data/farm.json';
import crops from './data/crops.json';

const { Overlay } = LayersControl;

class App extends Component {
  
  constructor(props) {
    super(props);
    const { innerWidth: width, innerHeight: height } = window;
    const { center, zoom } = fitBounds(farm.fields, {width, height})
    this.state = {
        width,
        height,
        center,
        zoom
    };
  }

  render() {
    const { width, height, center, zoom } = this.state;

    return (
        <Map
          style={{ width, height }}
          center={center}
          zoom={zoom}
          ref="map"
        >
          <LayersControl position="topright">
  
              <SimpleComponent position="topright" >
                <h1>Overall stat</h1>
              </SimpleComponent>
            
              {farm.fields.map(field => {
                  const fillColor = getColor(500);
                  const style = { DEFAULT_FIELD_STYLE, ...{fillColor}};
                  return (
                      <Overlay name={field.name} key={field.name} checked={true}>
                        <GeoJSON
                            style={style}
                            key={field.name}
                            data={field.boundary}
                            checked={true}
                        >
                          <Tooltip
                              permanent
                              direction="topleft"
                              offset={[0, 0]}
                              className="leaflet-tooltip-field"
                          >
                            <button>
                              Change {getFieldYield(field, crops[0])}
                            </button>
                          </Tooltip>
                        </GeoJSON>
                      </Overlay>
                  )
                }
              )}
  
            <SimpleComponent position="bottomright" >
              <h1>!!!</h1>
            </SimpleComponent>

            <SimpleComponent position="bottomleft" >
                <h1>Add crops</h1>
            </SimpleComponent>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            
          </LayersControl>
        </Map>
    );
  }
}

export default App;
