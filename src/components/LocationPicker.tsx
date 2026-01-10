import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import { Search, MapPin } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface LocationPickerProps {
    onLocationSelect: (lat: number, lng: number, address: string) => void;
}

const LocationMarker = ({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) => {
    const [position, setPosition] = useState<L.LatLng | null>(null);
    const map = useMap();

    useMapEvents({
        click(e) {
            setPosition(e.latlng);
            onLocationSelect(e.latlng.lat, e.latlng.lng);
            map.flyTo(e.latlng, map.getZoom());
        },
    });

    return position === null ? null : (
        <Marker position={position}></Marker>
    );
};

// Component to update map center programmatically
const MapUpdater = ({ center }: { center: [number, number] }) => {
    const map = useMap();
    useEffect(() => {
        map.flyTo(center, 13);
    }, [center, map]);
    return null;
};

const LocationPicker = ({ onLocationSelect }: LocationPickerProps) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [mapCenter, setMapCenter] = useState<[number, number]>([20.5937, 78.9629]); // Default to India center

    const handleSearch = async () => {
        if (!searchQuery) return;
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
            const data = await response.json();
            if (data && data.length > 0) {
                const { lat, lon, display_name } = data[0];
                const newLat = parseFloat(lat);
                const newLng = parseFloat(lon);
                setMapCenter([newLat, newLng]);
                onLocationSelect(newLat, newLng, display_name);
            }
        } catch (error) {
            console.error("Error searching location:", error);
        }
    };

    const handleMapClick = async (lat: number, lng: number) => {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await response.json();
            if (data) {
                setSearchQuery(data.display_name); // Update input with address
                onLocationSelect(lat, lng, data.display_name);
            }
        } catch (error) {
            console.error("Error reverse geocoding:", error);
            const fallbackAddr = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
            setSearchQuery(fallbackAddr);
            onLocationSelect(lat, lng, fallbackAddr);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex gap-2">
                <Input
                    placeholder="Search for a location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch} size="icon" variant="secondary">
                    <Search className="w-4 h-4" />
                </Button>
            </div>

            <div className="h-[300px] w-full rounded-md overflow-hidden border relative z-0">
                <MapContainer center={mapCenter} zoom={5} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationMarker onLocationSelect={handleMapClick} />
                    <MapUpdater center={mapCenter} />
                </MapContainer>

                {/* Overlay hint */}
                <div className="absolute bottom-2 left-2 right-2 bg-background/80 backdrop-blur-sm p-2 rounded text-xs text-center border pointer-events-none z-[1000]">
                    <MapPin className="w-3 h-3 inline mr-1" />
                    Click on the map to set precise location
                </div>
            </div>
        </div>
    );
};

export default LocationPicker;
