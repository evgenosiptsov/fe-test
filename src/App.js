import React, { Component } from 'react';
import { Map, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import { DEFAULT_FIELD_STYLE } from './constants/styles'
import { getColor } from './lib/fields'
import farm from './data/farm.json';
import crops from './data/crops.json';

class App extends Component {
  render() {
    return (
      <div>
        <Map
          style={{ width: '100%', height: '500px' }}
          center={farm.centre.coordinates}
          zoom={13}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {farm.fields.map(field => {
                const fillColor = getColor(100);
                const style = { DEFAULT_FIELD_STYLE, ...fillColor};
                return (
                  <GeoJSON
                      style={style}
                      key={field.name}
                      data={field.boundary}
                  />
                )
              }
          )}
        </Map>
      </div>
    );
  }
}

export default App;
