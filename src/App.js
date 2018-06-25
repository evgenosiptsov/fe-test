import React, { Component } from 'react';
import { Map, TileLayer, GeoJSON, LayersControl, ScaleControl, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import { DEFAULT_FIELD_STYLE } from './constants/styles'
import { getColor } from './lib/fields'
import farm from './data/farm.json';
import crops from './data/crops.json';

const { BaseLayer, Overlay } = LayersControl;

class App extends Component {
  render() {
    return (
        <Map
          style={{ width: '100%', height: '800px' }}
          center={farm.centre.coordinates}
          zoom={13}
        >
 
          
          <LayersControl position="bottomleft">
            
            <Overlay name="Open Street" checked={true}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            </Overlay>
            
              {farm.fields.map(field => {
                    const fillColor = getColor(100);
                    const style = { DEFAULT_FIELD_STYLE, ...fillColor};
                    return (
                        <BaseLayer name={field.name} checked={true}>
                          <GeoJSON
                              style={style}
                              key={field.name}
                              data={field.boundary}
                              checked={true}
                          />
                        </BaseLayer>
                    )
                  }
              )}
            
          </LayersControl>
        </Map>
    );
  }
}

export default App;
