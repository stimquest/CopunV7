
'use client';

import React, { useContext, createContext, useState, useMemo } from 'react';
import Map, { Marker, Popup, NavigationControl, FullscreenControl, ScaleControl, GeolocateControl, useMap } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { Observation, ObservationCategory } from '@/lib/types';
import { Pin } from 'lucide-react';
import { cn } from '@/lib/utils';

export const ObservationContext = createContext<Observation[]>([]);

const categoryColors: Record<ObservationCategory, string> = {
  "Faune": "text-blue-500 fill-blue-500",
  "Flore": "text-green-500 fill-green-500",
  "Pollution": "text-orange-500 fill-orange-500",
  "Phénomène inhabituel": "text-purple-500 fill-purple-500",
};

function Markers() {
  const observations = useContext(ObservationContext);
  const [popupInfo, setPopupInfo] = useState<Observation | null>(null);

  const pins = useMemo(
    () =>
      observations
        .filter(obs => !isNaN(obs.latitude) && !isNaN(obs.longitude))
        .map((obs) => (
        <Marker
          key={`marker-${obs.id}`}
          longitude={obs.longitude}
          latitude={obs.latitude}
          anchor="bottom"
        >
          <div 
            onMouseEnter={() => setPopupInfo(obs)}
            onMouseLeave={() => setPopupInfo(null)}
          >
            <Pin className={cn("w-6 h-6 cursor-pointer", categoryColors[obs.category])} />
          </div>
        </Marker>
      )),
    [observations]
  );

  return <>
    {pins}
    {popupInfo && (
      <Popup
          anchor="top"
          longitude={Number(popupInfo.longitude)}
          latitude={Number(popupInfo.latitude)}
          onClose={() => setPopupInfo(null)}
          className="z-10"
          closeButton={false}
          closeOnClick={false}
      >
          <div className="prose prose-sm max-w-xs">
              <h3 className="font-bold text-base mb-1">{popupInfo.title}</h3>
              <p className="text-xs text-muted-foreground mt-0">{popupInfo.description}</p>
              <span className={cn("text-xs font-semibold", categoryColors[popupInfo.category].replace('fill-', 'text-'))}>{popupInfo.category}</span>
          </div>
      </Popup>
    )}
  </>;
}

interface MapWrapperProps {
    isPlacingObservation: boolean;
    onMapClick: (coords: { lat: number; lng: number }) => void;
    newObservationCoords: { lat: number; lng: number } | null;
}

export default function MapWrapper({ isPlacingObservation, onMapClick, newObservationCoords }: MapWrapperProps) {
  const maptilerApiKey = process.env.NEXT_PUBLIC_MAPTILER_KEY;
  
  const initialViewState = {
    longitude: -1.58,
    latitude: 49.05,
    zoom: 12,
  };

  if (!maptilerApiKey) {
    return (
        <div className="h-[400px] bg-muted rounded-lg flex items-center justify-center">
            <p className="text-center text-muted-foreground">La clé API MapTiler est manquante.<br/>Veuillez l'ajouter à votre fichier .env</p>
        </div>
    )
  }

  const cursorStyle = isPlacingObservation ? 'crosshair' : 'grab';

  return (
    <div className="h-[400px] w-full rounded-lg z-0 overflow-hidden relative">
        <Map
            initialViewState={initialViewState}
            mapStyle={`https://api.maptiler.com/maps/streets/style.json?key=${maptilerApiKey}`}
            style={{width: '100%', height: '100%'}}
            mapboxAccessToken={maptilerApiKey}
            onClick={(e) => {
              if (isPlacingObservation) {
                onMapClick({ lat: e.lngLat.lat, lng: e.lngLat.lng });
              }
            }}
            cursor={cursorStyle}
        >
            <GeolocateControl position="top-left" />
            <FullscreenControl position="top-left" />
            <NavigationControl position="top-left" />
            <ScaleControl />

            <Markers />

            {isPlacingObservation && newObservationCoords && (
                <Marker
                    longitude={newObservationCoords.lng}
                    latitude={newObservationCoords.lat}
                    anchor="bottom"
                >
                    <Pin className="w-6 h-6 text-red-500 fill-red-500 animate-pulse" />
                </Marker>
            )}
        </Map>
        {isPlacingObservation && (
            <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-background/80 text-foreground text-sm px-3 py-1 rounded-full shadow-lg pointer-events-none">
                Cliquez sur la carte pour placer le marqueur
            </div>
        )}
    </div>
  );
}
