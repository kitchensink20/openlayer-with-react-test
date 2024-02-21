import React, { useRef, useEffect } from "react";
import "./index.css";
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import Feature from 'ol/Feature.js';
import {Icon, Style} from 'ol/style.js';
import Point from 'ol/geom/Point.js';
import { Vector as VectorSource} from 'ol/source.js';
import {Vector as VectorLayer} from 'ol/layer.js';

const iconFeature = new Feature({
    geometry: new Point([3401008.245778, 6533087.139477]),
    name: 'Heart'
});

const iconStyle = new Style({
    image: new Icon({
      anchor: [0.5, 46],
      anchorXUnits: 'fraction',
      anchorYUnits: 'pixels',
      src: '../public/images/pushpin.png',
      scale: 0.02
    }),
});

function MapComponent() {
  const mapRef = useRef();

  useEffect(() => {
    iconFeature.setStyle(iconStyle);

    new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        new VectorLayer({
            source:  new VectorSource({features: [iconFeature]}),
        })
      ],
      view: new View({
        center: [0, 0],
        zoom: 2,
      }),
    });
  }, []);

  return <div ref={mapRef} id="map"></div>;
};

export default MapComponent;