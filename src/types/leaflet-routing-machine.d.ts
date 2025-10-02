import * as L from "leaflet";

declare module "leaflet" {
  namespace Routing {
    function control(options: RoutingControlOptions): L.Control;

    interface RoutingControlOptions {
      waypoints: L.LatLng[];
      lineOptions?: {
        styles?: Array<{ color: string; weight: number }>;
      };
      addWaypoints?: boolean;
      draggableWaypoints?: boolean;
      fitSelectedRoutes?: boolean;
      show?: boolean;
    }
  }
}

declare module "leaflet-routing-machine";
