import { useRef, useEffect, useState } from "react"; 
import TileLayer from 'ol/layer/Tile.js';
import OSM from 'ol/source/OSM.js';
import Feature from 'ol/Feature.js';
import Map from 'ol/Map.js';
import Point from 'ol/geom/Point.js';
import View from 'ol/View.js';
import { Icon, Style } from 'ol/style.js';
import { Vector as VectorSource } from 'ol/source.js';
import { Vector as VectorLayer } from 'ol/layer.js';
import './index.css';
import { Aircraft } from "./types"; 

function MapComponent() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [positions, setPositions] = useState<Aircraft[]>([]);
  const mapInstanceRef = useRef<Map | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://radarcape-demo.jetvision.de/aircraftlist.json');
        const newPositions = await response.json();
        setPositions(newPositions);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const featuresArray: Feature[] = positions
      .filter(pos => pos.lon !== null && pos.lat !== null)
      .map(pos => getPlaneIconFeature(pos.lon!, pos.lat!));

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = new Map({
        layers: [
          new TileLayer({
            source: new OSM(),
          }),
          new VectorLayer({
            source: new VectorSource({ features: featuresArray }),
          }),
        ],
        view: new View({
          center: [0, 0],
          zoom: 2,
        }),
        target: mapRef.current!,
      });
    } else {
      const vectorLayer = mapInstanceRef.current.getLayers().getArray()[1];
      const vectorSource = vectorLayer.getSource();
      vectorSource.clear();
      vectorSource.addFeatures(featuresArray);
    }
  }, [positions]);

  return <div ref={mapRef} id="map"></div>;
}

function getPlaneIconFeature(lat: number, lon: number) {
  const iconFeature = new Feature({
    geometry: new Point([lat,lon]),
    name: 'Plane',
  });

  const iconStyle = new Style({
    image: new Icon({
      anchor: [0.5, 0.5],
      anchorXUnits: 'fraction',
      anchorYUnits: 'fraction',
      src: '../public/images/airplane.png',
      scale: 0.1,
    }),
  });

  iconFeature.setStyle(iconStyle);

  return iconFeature;
}

export default MapComponent;