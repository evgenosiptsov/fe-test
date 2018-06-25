import React, { Component } from 'react';
import { Map, TileLayer, GeoJSON, LayersControl, ScaleControl, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import { DEFAULT_FIELD_STYLE } from './constants/styles'
import { getColor } from './lib/fields'
import SimpleControl from './components/SimpleControl'
import farm from './data/farm.json';
import crops from './data/crops.json';

const { Overlay } = LayersControl;

class App extends Component {
  
  constructor(props) {
    super(props);
    this.state = { width: '100%', height: '800px' };
    this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
  }
  
  componentWillMount() {
    this.updateWindowDimensions();
    window.addEventListener('resize', this.updateWindowDimensions);
  }
  
  componentWillUnmount() {
    window.removeEventListener('resize', this.updateWindowDimensions);
  }
  
  updateWindowDimensions() {
    this.setState({ width: window.innerWidth, height: window.innerHeight });
  }
  
  render() {
    const {width, height} = this.state;
    
    return (
        <Map
          style={{ width, height }}
          center={farm.centre.coordinates}
          zoom={13}
        >
          <LayersControl position="topright">
  
              <SimpleControl position="topright" >
                <h1>!!!</h1>
              </SimpleControl>
            
              {farm.fields.map(field => {
                  const fillColor = getColor(100);
                  const style = { DEFAULT_FIELD_STYLE, ...fillColor};
                  return (
                      <Overlay name={field.name} checked={true}>
                        <GeoJSON
                            style={style}
                            key={field.name}
                            data={field.boundary}
                            checked={true}
                        />
                      </Overlay>
                  )
                }
              )}
  
            <SimpleControl position="bottomright" >
              <h1>!!!</h1>
            </SimpleControl>
  
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            
          </LayersControl>
        </Map>
    );
  }
}

export default App;
