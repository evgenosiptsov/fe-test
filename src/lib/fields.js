export function getColor(d) {
	return d > 1000 ? '#800026' :
		d > 500  ? '#BD0026' :
		d > 200  ? '#E31A1C' :
		d > 100  ? '#FC4E2A' :
		d > 50   ? '#FD8D3C' :
		d > 20   ? '#FEB24C' :
		d > 10   ? '#FED976' : '#FFEDA0';
}

export function fitBounds(fields, { width, height }) {
    let fittedData;
    const TILE_SIZE = 256;

    const world2LatLng = function({ x, y }) {
        const n = Math.PI - 2 * Math.PI * y;

        // TODO test that this is faster
        return {
            lat: 180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n))),
            lng: x * 360 - 180,
        };
    }

    const latLng2World = function({ lat, lng }) {
        const sin = Math.sin(lat * Math.PI / 180);
        const x = lng / 360 + 0.5;
        let y = 0.5 - 0.25 * Math.log((1 + sin) / (1 - sin)) / Math.PI;

        y = y < 0 // eslint-disable-line
            ? 0
            : y > 1 ? 1 : y;
        return { x, y };
    }

    const fitNwSe = function(nw, se, width, height) {
        const EPS = 0.000000001;
        const nwWorld = latLng2World(nw);
        const seWorld = latLng2World(se);
        const dx = nwWorld.x < seWorld.x
            ? seWorld.x - nwWorld.x
            : 1 - nwWorld.x + seWorld.x;
        const dy = seWorld.y - nwWorld.y;

        if (dx <= 0 && dy <= 0) {
            return null;
        }

        const zoomX = Math.log2(width / TILE_SIZE / dx);
        const zoomY = Math.log2(height / TILE_SIZE / dy);
        const zoom = Math.floor(EPS + Math.min(zoomX, zoomY));

        const middle = {
            x: nwWorld.x < seWorld.x // eslint-disable-line
                ? 0.5 * (nwWorld.x + seWorld.x)
                : nwWorld.x + seWorld.x - 1 > 0
                    ? 0.5 * (nwWorld.x + seWorld.x - 1)
                    : 0.5 * (1 + nwWorld.x + seWorld.x),
            y: 0.5 * (nwWorld.y + seWorld.y),
        };

        const scale = Math.pow(2, zoom);
        const halfW = width / scale / TILE_SIZE / 2;
        const halfH = height / scale / TILE_SIZE / 2;

        const newNW = world2LatLng({
            x: middle.x - halfW,
            y: middle.y - halfH,
        });

        const newSE = world2LatLng({
            x: middle.x + halfW,
            y: middle.y + halfH,
        });

        return {
            center: world2LatLng(middle),
            zoom,
            newBounds: {
                nw: newNW,
                se: newSE,
            },
        };
    };

    const {nw, se} = fields.reduce(({nw, se}, field) => {
        //TODO: add object checks
        const coordinates = field.boundary.coordinates[0];
        const lats = coordinates.map((coordinate) => coordinate[0]).concat([nw.lat])
        const lngs = coordinates.map((coordinate) => coordinate[1]).concat([nw.lng])

        return {
            nw: {
                lat: Math.min.apply(Math, lats),
                lng: Math.max.apply(Math, lngs),
            },
            se: {
                lat: Math.max.apply(Math, lats),
                lng: Math.min.apply(Math, lngs),
            }
        }

    }, {nw: {lat: 0, lng: 0}, se: {lat: 0, lng: 0}});

    return fitNwSe(nw, se, width, height);
}
