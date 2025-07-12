"use client"

import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';

interface MapDisplayProps {
  latitude: number;
  longitude: number;
  hotelName: string;
}

const containerStyle = {
  width: '100%',
  height: '100%'
};

const MapDisplay: React.FC<MapDisplayProps> = ({ latitude, longitude, hotelName }) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!
  })

  const center = {
    lat: latitude,
    lng: longitude
  };

  if (!isLoaded) {
    return <div className="bg-gray-200 animate-pulse w-full h-full rounded-xl"></div>
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={15}
      options={{
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
        zoomControl: true,
      }}
    >
      <MarkerF position={center} title={hotelName} />
    </GoogleMap>
  )
}

export default MapDisplay; 