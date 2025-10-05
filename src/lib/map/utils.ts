export const extractPlaceName = (nominatimResponse) => {
  if (!nominatimResponse) {
    return 'Unknown Location';
  }

  const { display_name, address } = nominatimResponse;


  if (address) {
    const placeComponentSet = new Set([
      address.amenity,
      address.village,
      address.town,
      address.city,
      address.municipality,
      address.county,
    ].filter(Boolean));

    const placeComponents = Array.from(placeComponentSet).slice(0, 2);

    console.log(nominatimResponse, placeComponents)

    if (address.state) {
      placeComponents.push(address.state);
    }

    if (address.country) {
      placeComponents.push(address.country);
    }

    if (placeComponents.length > 0) {
      return placeComponents.join(', ');
    }
  }

  if (display_name) {
    const parts = display_name.split(',').map(part => part.trim());
    return parts.slice(0, 2).join(', ');
  }

  return 'unknownLocation';
};

export const formatCoordinates = (lat, lon) => {
  return `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
};

export const convertKmsToMs = (kmPerSecond) => {
  return kmPerSecond * 1000;
};

export const convertMsToKms = (meterPerSecond) => {
  return meterPerSecond / 1000;
};

export const formatDistance = (meters) => {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`;
  }
  return `${Math.round(meters)} m`;
};