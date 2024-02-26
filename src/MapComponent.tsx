import { useRef, useEffect, useState } from "react"; 
import TileLayer from 'ol/layer/Tile.js';
import OSM from 'ol/source/OSM.js';
import Feature from 'ol/Feature.js';
import Map from 'ol/Map.js';
import Point from 'ol/geom/Point.js';
import View from 'ol/View.js';
import { Icon, Style, Text } from 'ol/style.js';
import { Vector as VectorSource } from 'ol/source.js';
import { Vector as VectorLayer } from 'ol/layer.js';
import './index.css';
import { Aircraft } from "./types"; 
import { transform } from 'ol/proj.js';

function MapComponent() {
  const [positions, setPositions] = useState<Aircraft[]>([]);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<Map>();

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
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const featuresArray: Feature[] = positions
      .filter(pos => pos.lon !== null && pos.lat !== null)
      .map(pos => getPlaneIconFeature(pos.lon!, pos.lat!, pos.fli, pos.alt));

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
          zoom: 3,
          projection: 'EPSG:3857',
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

function getPlaneIconFeature(lon: number, lat: number, label: string | null, alt: number | null) {
  const transformedCoords = transform([lon, lat], 'EPSG:4326', 'EPSG:3857');

  const iconFeature = new Feature({
    geometry: new Point(transformedCoords),
    name: 'Plane',
  });

  const iconStyle = new Style({
    image: new Icon({
      anchor: [0.5, 0.5],
      anchorXUnits: 'fraction',
      anchorYUnits: 'fraction',
      src: alt == null ? '../public/images/onground_airplane.png' : alt < 10000 ?  '../public/images/airplane_blue.png' : alt < 250000 ? '../public/images/airplane_yellow.png' : '../public/airplane_white.png',
      scale: 0.2,
    }),
    text: new Text({
      text: label ? label : '',
      font: 'bold 03.em Calibri,sans-serif',
      offsetY: 20,
      offsetX: 20
    }),
  });

  iconFeature.setStyle(iconStyle);

  return iconFeature;
}

export default MapComponent;