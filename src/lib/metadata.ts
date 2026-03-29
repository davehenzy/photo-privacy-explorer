import ExifReader from 'exifreader';

export interface PhotoMetadata {
  gps?: {
    latitude: number;
    longitude: number;
    bearing?: number;
  };
  Make?: string;
  Model?: string;
  LensModel?: string;
  ISO?: string;
  ExposureTime?: string;
  DateTime?: string;
  DateTimeOriginal?: string;
}

export function parseExif(arrayBuffer: ArrayBuffer): PhotoMetadata | null {
  try {
    const rawData = ExifReader.load(arrayBuffer);
    const metadata: PhotoMetadata = {};

    // Extract Basic Tags
    if (rawData['Make']) metadata.Make = rawData['Make'].description;
    if (rawData['Model']) metadata.Model = rawData['Model'].description;
    if (rawData['LensModel']) metadata.LensModel = rawData['LensModel'].description;
    if (rawData['ISOSpeedRatings']) metadata.ISO = rawData['ISOSpeedRatings'].description;
    if (rawData['ExposureTime']) metadata.ExposureTime = rawData['ExposureTime'].description;
    if (rawData['DateTime']) metadata.DateTime = rawData['DateTime'].description;
    if (rawData['DateTimeOriginal']) metadata.DateTimeOriginal = rawData['DateTimeOriginal'].description;

    // Extract GPS Tags
    if (rawData['GPSLatitude'] && rawData['GPSLongitude']) {
      const lat = rawData['GPSLatitude'].description as unknown as number;
      const lon = rawData['GPSLongitude'].description as unknown as number;
      const latRef = rawData['GPSLatitudeRef']?.value?.[0] || 'N';
      const lonRef = rawData['GPSLongitudeRef']?.value?.[0] || 'E';

      metadata.gps = {
        latitude: latRef === 'S' ? -Math.abs(lat) : Math.abs(lat),
        longitude: lonRef === 'W' ? -Math.abs(lon) : Math.abs(lon),
      };

      // GPS Bearing
      if (rawData['GPSDestBearing']) {
        metadata.gps.bearing = rawData['GPSDestBearing'].value as unknown as number;
      } else if (rawData['GPSImgDirection']) {
        metadata.gps.bearing = rawData['GPSImgDirection'].value as unknown as number;
      }
    }

    return metadata;
  } catch (error) {
    console.error('Failed to parse EXIF metadata:', error);
    return null;
  }
}
