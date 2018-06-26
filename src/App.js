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
    const { center, zoom } = fitBounds(farm.fields, {width, height});
    const planted = {};
    this.state = {
        width,
        height,
        center,
        zoom,
        planted,
    };
  }

  render() {
    const { width, height, center, zoom, planted } = this.state;

    return (
        <Map
          style={{ width, height }}
          center={center}
          zoom={zoom}
          ref="map"
        >
          <LayersControl position="bottomright">
  
              <SimpleComponent position="topright" className="leaflet-control-actions">
                <h1>Overall stat</h1>
              </SimpleComponent>
            
              {farm.fields.map(field => {
                  const { name, boundary } = field
                  const plantedCrop[]
                  const potentialYield = getFieldYield(field, planted[name])
                  const fillColor = getColor(potentialYield);
                  const style = Object.assign({}, DEFAULT_FIELD_STYLE, { fillColor });
                  return (
                      <Overlay name={field.name} key={field.name} checked={true}>
                        <GeoJSON
                            style={style}
                            key={name}
                            data={boundary}
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
  
            <SimpleComponent position="bottomright" className="leaflet-control-actions">
              <div>Legend</div>
            </SimpleComponent>

            <SimpleComponent position="bottomleft" className="leaflet-control-actions">
                <div>
                    Crops:
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
