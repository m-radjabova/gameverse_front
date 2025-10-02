import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";
import { useEffect } from "react";

type Props = {
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
};

function Routing({ origin, destination }: Props) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(origin.lat, origin.lng),
        L.latLng(destination.lat, destination.lng),
      ],
      lineOptions: {
        styles: [{ color: "red", weight: 4 }],
      },
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
    }).addTo(map);

    return () => {
      map.removeControl(routingControl);
    };
  }, [map, origin, destination]);

  return null;
}

export default function RouteMap({ origin, destination }: Props) {
  return (
    <MapContainer
      center={[origin.lat, origin.lng]}
      zoom={13}
      style={{ height: "400px", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Routing origin={origin} destination={destination} />
    </MapContainer>
  );
}
