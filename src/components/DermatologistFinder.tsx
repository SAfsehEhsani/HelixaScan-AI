import React, { useEffect, useState, useCallback } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { MapPin, Navigation, Phone, Globe, Star, Loader2, X } from 'lucide-react';
import { motion } from 'motion/react';

const API_KEY = process.env.GOOGLE_MAPS_PLATFORM_KEY || '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

interface FinderProps {
  onClose: () => void;
}

const FinderContent: React.FC = () => {
  const map = useMap();
  const placesLib = useMapsLibrary('places');
  const [places, setPlaces] = useState<google.maps.places.Place[]>([]);
  const [selected, setSelected] = useState<google.maps.places.Place | null>(null);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral | null>(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(loc);
        map?.panTo(loc);
      },
      () => {
        // Fallback to a default location if geolocation fails
        setUserLocation({ lat: 37.42, lng: -122.08 });
      }
    );
  }, [map]);

  useEffect(() => {
    if (!placesLib || !userLocation) return;

    setLoading(true);
    placesLib.Place.searchNearby({
      locationRestriction: { center: userLocation, radius: 5000 },
      includedPrimaryTypes: ['doctor', 'hospital'],
      fields: ['displayName', 'location', 'formattedAddress', 'rating', 'id', 'nationalPhoneNumber', 'websiteURI'],
      maxResultCount: 15,
    }).then(({ places }) => {
      // Filter for dermatologists if possible, or just keep doctors
      setPlaces(places);
      setLoading(false);
    }).catch(err => {
      console.error("Places search error:", err);
      setLoading(false);
    });
  }, [placesLib, userLocation]);

  const handleMarkerClick = useCallback(async (place: google.maps.places.Place) => {
    await place.fetchFields({ fields: ['displayName', 'formattedAddress', 'rating', 'photos', 'nationalPhoneNumber', 'websiteURI'] });
    setSelected(place);
    if (place.location) map?.panTo(place.location);
  }, [map]);

  return (
    <>
      {places.map(place => (
        <AdvancedMarker
          key={place.id}
          position={place.location}
          onClick={() => handleMarkerClick(place)}
        >
          <Pin background="#10b981" glyphColor="#fff" borderColor="#065f46" />
        </AdvancedMarker>
      ))}

      {userLocation && (
        <AdvancedMarker position={userLocation}>
          <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse" />
        </AdvancedMarker>
      )}

      {selected?.location && (
        <InfoWindow position={selected.location} onCloseClick={() => setSelected(null)}>
            <div className="max-w-[220px] p-2">
              <h3 className="font-serif text-wellness-ink text-base leading-tight font-medium">{selected.displayName}</h3>
              <p className="text-[10px] text-wellness-ink/50 mt-1 uppercase tracking-wider font-bold">{selected.formattedAddress}</p>
              {selected.rating && (
                <div className="flex items-center gap-1 mt-2">
                  <Star size={12} className="fill-wellness-gold text-wellness-gold" />
                  <span className="text-xs font-bold text-wellness-ink">{selected.rating}</span>
                </div>
              )}
              <div className="flex gap-2 mt-4">
                {selected.nationalPhoneNumber && (
                  <a href={`tel:${selected.nationalPhoneNumber}`} className="p-2 bg-wellness-accent/10 text-wellness-accent rounded-xl hover:bg-wellness-accent/20 transition-all shadow-sm">
                    <Phone size={14} />
                  </a>
                )}
                {selected.websiteURI && (
                  <a href={selected.websiteURI} target="_blank" rel="noopener noreferrer" className="p-2 bg-wellness-soft text-wellness-ink/60 rounded-xl hover:bg-wellness-soft/80 transition-all shadow-sm">
                    <Globe size={14} />
                  </a>
                )}
              </div>
            </div>
        </InfoWindow>
      )}

      {loading && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] flex items-center justify-center z-10">
          <div className="bg-white p-4 rounded-2xl shadow-xl flex items-center gap-3">
            <Loader2 className="animate-spin text-emerald-600" size={20} />
            <span className="text-sm font-bold text-slate-700">Finding Specialists...</span>
          </div>
        </div>
      )}
    </>
  );
};

export const DermatologistFinder: React.FC<FinderProps> = ({ onClose }) => {
  if (!hasValidKey) {
    return (
      <div className="fixed inset-0 z-[60] bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-6">
          <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
            <MapPin size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Google Maps API Key Required</h2>
          <p className="text-slate-600">To find nearby dermatologists, you need to add a Google Maps API key to your secrets.</p>
          
          <div className="bg-slate-50 p-4 rounded-2xl text-left text-sm space-y-3 border border-slate-200">
            <p><strong>1.</strong> Get a key: <a href="https://console.cloud.google.com/google/maps-apis/credentials" target="_blank" rel="noopener" className="text-blue-600 underline">Google Cloud Console</a></p>
            <p><strong>2.</strong> Open <strong>Settings</strong> (⚙️ gear icon) → <strong>Secrets</strong></p>
            <p><strong>3.</strong> Add <code>GOOGLE_MAPS_PLATFORM_KEY</code> as the name and your key as the value.</p>
          </div>
          
          <button
            onClick={onClose}
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-wellness-ink/60 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-wellness-bg w-full max-w-4xl h-[80vh] rounded-[3rem] overflow-hidden flex flex-col shadow-2xl border border-white"
      >
        <div className="p-8 border-b border-wellness-ink/5 flex items-center justify-between bg-white/50 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-wellness-accent/10 rounded-2xl text-wellness-accent">
              <Navigation size={24} />
            </div>
            <div>
              <p className="section-label">Dermatologists & Clinics</p>
              <h3 className="text-2xl font-serif text-wellness-ink">Nearby Specialists</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-wellness-soft rounded-full transition-colors text-wellness-ink/30"
          >
            <X size={28} />
          </button>
        </div>

        <div className="flex-1 relative">
          <APIProvider apiKey={API_KEY} version="weekly">
            <Map
              defaultCenter={{ lat: 37.42, lng: -122.08 }}
              defaultZoom={13}
              mapId="DEMO_MAP_ID"
              // @ts-ignore
              internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
              style={{ width: '100%', height: '100%' }}
              disableDefaultUI={true}
              zoomControl={true}
            >
              <FinderContent />
            </Map>
          </APIProvider>
        </div>
        
        <div className="p-6 bg-wellness-soft/50 border-t border-wellness-ink/5">
          <p className="text-[10px] text-wellness-ink/40 text-center uppercase tracking-widest font-bold">
            Results powered by Google Maps Platform
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};
