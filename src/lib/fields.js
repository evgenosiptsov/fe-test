import { LatLng, LatLngBounds } from 'leaflet';

export function getColor(d) {
  return d > 1000 ? '#800026' :
      d > 500 ? '#BD0026' :
          d > 200 ? '#E31A1C' :
              d > 100 ? '#FC4E2A' :
                  d > 50 ? '#FD8D3C' :
                      d > 20 ? '#FEB24C' :
                          d > 10 ? '#FED976' : '#FFEDA0';
}

export function fitBounds(fields) {

  const lists = fields.reduce(([allLatitudes, allLongitudes], field) => {
      const fieldCoordinates = field.boundary.coordinates[0];
      const fieldLatitudes = fieldCoordinates.map((fc) => fc[0]);
      const fieldLongitudes = fieldCoordinates.map((fc) => fc[1]);

      return [allLatitudes.concat(fieldLatitudes), allLongitudes.concat(fieldLongitudes)]
    }, [[], []]);

  const northEast = new LatLng(Math.max.apply(Math, lists[1]), Math.max.apply(Math, lists[0]))
  const southWest = new LatLng(Math.min.apply(Math, lists[1]), Math.min.apply(Math, lists[0]))
    
  return new LatLngBounds(southWest, northEast);
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
      price_per_tonne: pricePerTonne,
  } = crop;

  const {
      disease_susceptibility: fieldDiseaseSusceptibility,
      hectares:  hectaresOfField,
  } = field;

  return (cropYieldAverage * hectaresOfField / (cropRiskFactor * fieldDiseaseSusceptibility)) * pricePerTonne;
}

/**
 * Get all yields
 * @param fields
 * @param plantedFields
 */
export function getYields(fields, plantedFields) {
  let yields = {};
    
  fields.filter((field) => plantedFields[field.name]).forEach((field) => {
      yields[field.name] = getYieldOfField(field, plantedFields[field.name]);
    });
	
  return yields;
}

export function makeForecasts(fields, crops) {
  let forecasts = {};
  let potential = 0;
    
  //TODO rough calculations
  fields.forEach((field) => {
      if (!forecasts[field.name]) {
        forecasts[field.name] = {};
      }

      crops.forEach((crop) => {
          forecasts[field.name][crop.name] = getYieldOfField(field, crop);
        });
      potential = potential + Math.max.apply(Math, Object.values(forecasts[field.name]))
    });
	
  return {
	  potential,
      forecasts,
	};
}


export function makeRecommendations(fields, crops) {
	let recommendations = {};
	
	fields.forEach((field) => {
		crops.forEach((crop) => {
			const { name } = field;
			const expected = getYieldOfField(field, crop);
			const recommendation = recommendations[crop.name] || { expected, name };

			if (recommendation.expected < expected) {
				recommendations[crop.name] = { expected, name };
			} else {
				recommendations[crop.name] = recommendation;
			}
		});
	});
	
	return recommendations;
}

