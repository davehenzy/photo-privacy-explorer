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
    const rawData = ExifReader.load(arrayBuffer) as Record<string, { description: string; value: any }>;
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
      try {
        const lat = rawData['GPSLatitude'].description;
        const lon = rawData['GPSLongitude'].description;
        const latRefTag = rawData['GPSLatitudeRef'];
        const lonRefTag = rawData['GPSLongitudeRef'];
        
        let finalLat = parseFloat(lat);
        let finalLon = parseFloat(lon);

        if (!isNaN(finalLat) && !isNaN(finalLon)) {
          // Robust Ref Check
          const latRef = String(latRefTag?.description || latRefTag?.value || 'N').toUpperCase();
          const lonRef = String(lonRefTag?.description || lonRefTag?.value || 'E').toUpperCase();

          metadata.gps = {
            latitude: latRef.includes('S') ? -Math.abs(finalLat) : Math.abs(finalLat),
            longitude: lonRef.includes('W') ? -Math.abs(finalLon) : Math.abs(finalLon),
          };

          // GPS Bearing extraction
          const bearingTag = rawData['GPSImgDirection'] || rawData['GPSDestBearing'];
          if (bearingTag) {
            const bDesc = bearingTag.description;
            const bVal = bearingTag.value;
            let b = parseFloat(bDesc);
            
            if (isNaN(b) && bVal) {
              if (Array.isArray(bVal)) {
                b = Number(bVal[0]) / (Number(bVal[1]) || 1);
              } else {
                b = Number(bVal);
              }
            }
            
            if (!isNaN(b)) {
              metadata.gps.bearing = b;
            }
          }
        }
      } catch (e) {
        console.error("GPS Parsing failed", e);
      }
    }

    return metadata;
  } catch (error) {
    console.error('Failed to parse EXIF metadata:', error);
    return null;
  }
}
