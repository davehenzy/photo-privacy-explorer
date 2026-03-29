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
    const rawData = ExifReader.load(arrayBuffer) as any;
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
      const lat = parseFloat(rawData['GPSLatitude'].description);
      const lon = parseFloat(rawData['GPSLongitude'].description);
      const latRefTag = rawData['GPSLatitudeRef'];
      const lonRefTag = rawData['GPSLongitudeRef'];
      
      const latRef = (latRefTag && latRefTag.value && Array.isArray(latRefTag.value)) ? latRefTag.value[0] : (latRefTag?.value || 'N');
      const lonRef = (lonRefTag && lonRefTag.value && Array.isArray(lonRefTag.value)) ? lonRefTag.value[0] : (lonRefTag?.value || 'E');

      metadata.gps = {
        latitude: String(latRef).includes('S') ? -Math.abs(lat) : Math.abs(lat),
        longitude: String(lonRef).includes('W') ? -Math.abs(lon) : Math.abs(lon),
      };

      // GPS Bearing extraction
      const bearingTag = rawData['GPSImgDirection'] || rawData['GPSDestBearing'];
      if (bearingTag && bearingTag.value) {
        const val = bearingTag.value;
        let b = 0;
        if (Array.isArray(val)) {
          b = Number(val[0]) / (Number(val[1]) || 1);
        } else {
          b = Number(val);
        }
        
        if (!isNaN(b)) {
          metadata.gps.bearing = b;
        }
      }
    }

    return metadata;
  } catch (error) {
    console.error('Failed to parse EXIF metadata:', error);
    return null;
  }
}
