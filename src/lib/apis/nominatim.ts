import axios from 'axios';
import i18nConfig from '../../../i18nConfig';

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

const nominatimClient = axios.create({
  baseURL: NOMINATIM_BASE_URL,
  timeout: 10000,
});

export const reverseGeocode = async (lat, lon, locale = i18nConfig.defaultLocale) => {
  try {
    const response = await nominatimClient.get('/reverse', {
      params: {
        lat,
        lon,
        format: 'json',
        "accept-language": locale,
      }
    });

    return response.data;
  } catch (error) {
    throw new Error(`Nominatim API error: ${error.message}`);
  }
};

export default nominatimClient;