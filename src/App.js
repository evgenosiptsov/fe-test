import React, { Component } from 'react';
import { Map, TileLayer, GeoJSON, LayersControl, ScaleControl, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import { DEFAULT_FIELD_STYLE } from './constants'
import { SimpleComponent } from './components'
import { getColor, fitBounds} from './lib/fields'
import farm from './data/farm.json';
import crops from './data/crops.json';

const { Overlay } = LayersControl;

class App extends Component {
  
  constructor(props) {
    super(props);
    this.state = { width: '100%', height: '800px' };
  }

  componentDidMount() {
    //TODO: bind listeners to window.resize
    this.setState({ width: window.innerWidth, height: window.innerHeight });
  }

  render() {
    const { width, height } = this.state;
    const { center, zoom } = fitBounds(farm.fields, {width, height})

    return (
        <Map
          style={{ width, height }}
          center={farm.centre.coordinates}
          zoom={12}
        >
          <LayersControl position="topright">
  
              <SimpleComponent position="topright" >
                <h1>Title</h1>
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
                              Change
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
  
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            
          </LayersControl>
        </Map>
    );
  }
}

export default App;
