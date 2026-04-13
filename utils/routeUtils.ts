/**
 * Route utilities for ORS (OpenRouteService) integration
 * Handles fetching real routing data instead of straight lines between points
 */

const ORS_BASE_URL = 'https://api.openrouteservice.org/v2/directions';
const ORS_API_KEY = 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjVlMjMxNjJjNGViMTQyZjc4ZjlmMzk5YzRkNTIxM2FmIiwiaCI6Im11cm11cjY0In0=';

export interface RouteCoordinate {
  latitude: number;
  longitude: number;
}

export interface ORSRouteResponse {
  coordinates: RouteCoordinate[];
  distance: number; // in meters
  duration: number; // in seconds
  steps: Array<{
    instruction: string;
    distance: number;
    duration: number;
    modifier?: string;
    type?: number;
  }>;
}

/**
 * Decodes a polyline string to coordinates
 * @param encoded The encoded polyline string
 * @param precision The precision factor (5 for Google Maps, 6 for ORS)
 */
function decodePolyline(encoded: string, precision: number = 5): RouteCoordinate[] {
  const factor = Math.pow(10, precision);
  let index = 0,
    lat = 0,
    lng = 0;
  const coordinates: RouteCoordinate[] = [];

  while (index < encoded.length) {
    let result = 0,
      shift = 0,
      byte;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    lat += result & 1 ? ~(result >> 1) : result >> 1;

    result = 0;
    shift = 0;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    lng += result & 1 ? ~(result >> 1) : result >> 1;

    coordinates.push({
      latitude: lat / factor,
      longitude: lng / factor,
    });
  }

  return coordinates;
}

/**
 * Fetches a route from ORS for a single leg (between two points)
 * @param startCoord Starting coordinate
 * @param endCoord Ending coordinate
 * @param mode Travel mode: 'driving-car', 'foot-walking', 'cycling-regular'
 */
export async function fetchORSRouteLeg(
  startCoord: RouteCoordinate,
  endCoord: RouteCoordinate,
  mode: 'driving-car' | 'foot-walking' | 'cycling-regular' = 'driving-car'
): Promise<ORSRouteResponse> {
  try {
    const url = `${ORS_BASE_URL}/${mode}?api_key=${ORS_API_KEY}&start=${startCoord.longitude},${startCoord.latitude}&end=${endCoord.longitude},${endCoord.latitude}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();

    if (!data.features || data.features.length === 0) {
      throw new Error('No route found');
    }

    const route = data.features[0];
    const geometry = route.geometry;

    // Decode polyline if it's encoded, otherwise use coordinates directly
    let coordinates: RouteCoordinate[] = [];
    if (typeof geometry === 'string') {
      // Encoded polyline
      coordinates = decodePolyline(geometry, 5);
    } else if (geometry.type === 'LineString' && Array.isArray(geometry.coordinates)) {
      // GeoJSON format
      coordinates = geometry.coordinates.map((coord: [number, number]) => ({
        latitude: coord[1],
        longitude: coord[0],
      }));
    }

    return {
      coordinates,
      distance: route.properties.summary?.distance || 0,
      duration: route.properties.summary?.duration || 0,
      steps: route.properties.segments?.[0]?.steps || [],
    };
  } catch (error) {
    console.error('[fetchORSRouteLeg] Error:', error);
    throw error;
  }
}

/**
 * Fetches a complete route connecting multiple stops
 * @param stops Array of stop coordinates
 * @param mode Travel mode
 */
export async function fetchCompleteRoute(
  stops: RouteCoordinate[],
  mode: 'driving-car' | 'foot-walking' | 'cycling-regular' = 'driving-car'
): Promise<{
  allCoordinates: RouteCoordinate[];
  legs: ORSRouteResponse[];
  totalDistance: number;
  totalDuration: number;
}> {
  if (stops.length < 2) {
    throw new Error('At least 2 stops required');
  }

  const legs: ORSRouteResponse[] = [];
  const allCoordinates: RouteCoordinate[] = [];
  let totalDistance = 0;
  let totalDuration = 0;

  // Fetch route for each leg
  for (let i = 0; i < stops.length - 1; i++) {
    const leg = await fetchORSRouteLeg(stops[i], stops[i + 1], mode);
    legs.push(leg);

    // Add coordinates (skip first coordinate of subsequent legs to avoid duplicates)
    if (i === 0) {
      allCoordinates.push(...leg.coordinates);
    } else {
      allCoordinates.push(...leg.coordinates.slice(1));
    }

    totalDistance += leg.distance;
    totalDuration += leg.duration;
  }

  return {
    allCoordinates,
    legs,
    totalDistance,
    totalDuration,
  };
}

/**
 * Gets travel mode icon info
 */
export function getTravelModeLabel(mode: 'driving-car' | 'foot-walking' | 'cycling-regular'): string {
  switch (mode) {
    case 'driving-car':
      return 'Ô tô';
    case 'cycling-regular':
      return 'Xe đạp';
    case 'foot-walking':
      return 'Đi bộ';
    default:
      return mode;
  }
}
