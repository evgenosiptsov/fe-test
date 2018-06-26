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

    const lists = fields.reduce(([allLatitudes, allLongitudes], field) => {
        const fieldCoordinates = field.boundary.coordinates[0];
        const fieldLatitudes = fieldCoordinates.map((fc) => fc[0])
        const fieldLongitudes = fieldCoordinates.map((fc) => fc[1])

        return [allLatitudes.concat(fieldLatitudes), allLongitudes.concat(fieldLongitudes)]
    }, [[], []]);

    const northWestPoint = {
        lat: Math.min.apply(Math, lists[0]),
        lng: Math.min.apply(Math, lists[1]),
    };

    const southEastPoint = {
        lat: Math.max.apply(Math, lists[0]),
        lng: Math.max.apply(Math, lists[1]),
    };

    return {
        center: [(northWestPoint.lng + southEastPoint.lng) / 2, (northWestPoint.lat + southEastPoint.lat) / 2],
        zoom: 14, //TODO calculate zoom
    }
}

/**
 * Crop Yield Average * Hectares of Field / (Crop Risk Factor * Field Disease Susceptibility) * price per tonne
 * @param field
 * @param crop
 * @returns {number}
 */
export function getYieldOfField(field, crop) {

    if (!crop) {
        return null;
    }

    const {
        disease_risk_factor: cropRiskFactor,
        expected_yield:  cropYieldAverage,
        price_per_tonne: pricePerTonne
    } = crop;

    const {
        disease_susceptibility: fieldDiseaseSusceptibility,
        hectares:  hectaresOfField,
    } = field;

    return (cropYieldAverage * hectaresOfField / (cropRiskFactor * fieldDiseaseSusceptibility)) * pricePerTonne
}
















