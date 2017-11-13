// Layers
var mapboxUrl = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}';
var accessToken = 'pk.eyJ1IjoicmljYXJkb2JjbSIsImEiOiJjajlrMTJkejQxaTUyMzNwZ3cxcnM3MDU2In0.pr0XFTVGiylyl6Sth57t9g';
var attrib = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>';

var streetsLayer = new L.TileLayer(mapboxUrl, {
    attribution: attrib,
    id: 'mapbox.streets',
    accessToken: accessToken
}),
    satelliteStreetLayer = new L.TileLayer(mapboxUrl, {
        attribution: attrib,
        id: 'mapbox.streets-satellite',
        accessToken: accessToken
    });

//Add map
var map = L.map('map', {
    center: [-5.1026, -42.8082],
    zoom: 12,
    minZoom: 12,
    maxZoom: 18,
    closePopupOnClick: true,
    attributionControl: true
});


var northWest = L.latLng(-4.904886794837085, -43.18674087524414),
southEast = L.latLng(-5.332669664718695, -42.37615585327149),
bounds = L.latLngBounds(northWest, southEast);
map.setMaxBounds(bounds);

//Add Fuse Search Control
var options = {
    position: 'topright',
    title: 'Busca',
    panelTitle: 'Buscador',
    placeholder: 'Exemplo: IFPI',
    maxResultLength: 10,
    threshold: 0.5,
    showInvisibleFeatures: true,
    caseSensitive: false,
    showResultFct: function (feature, container) {
        "use strict";
        props = feature.properties;
        var name = L.DomUtil.create('b', null, container);
        name.innerHTML = '<br/>' + props.nome;
        container.appendChild(L.DomUtil.create('br', null, container));
    }
};

var searchCtrl = L.control.fuseSearch(options);
map.addControl(searchCtrl);

//Layer Control
var baseLayers = {
    "Ruas" : streetsLayer.addTo(map),
    "Satelite" : satelliteStreetLayer
};
var controlLayers = L.control.layers(baseLayers, null).addTo(map);

//Add data geoJson
loadJSON('returnJsonOnly.php', function (data) {
    addGeoJsonLayerWithClustering(data);
    searchCtrl.indexFeatures(data.features, ['nome']);
});

function loadJSON(path, success, error) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                if (success) {
                    success(JSON.parse(xhr.responseText));
                }
            } else {
                if (error) {
                    error(xhr);
                }
            }
        }
    };
    xhr.open("GET", path, true);
    xhr.send();
}

// Markers Cluster
function addGeoJsonLayerWithClustering(data) {
    var markersCluster = L.markerClusterGroup({
        disableClusteringAtZoom: 13,
        showCoverageOnHover: true,
        spiderfyOnMaxZoom: false
    }),
        geoJsonLayer = L.geoJson(data, {
            onEachFeature: bindPopup
        });
    markersCluster.addLayer(geoJsonLayer).addTo(map);
    controlLayers.addOverlay(markersCluster, 'Pontos');
}

function bindPopup(feature, layer) {
    feature.layer = layer;
    props = feature.properties;
    if (props) {
        var desc = '<div class="row">';

            desc += '<div class="col-md-12"><strong>' + props.nome + '</strong><br/><br/></div>';
            desc += '<div class="col-md-12">Descrição' + '<br/>' + props.description + '<br/><br/></div>';    

            desc += '</div>'; 

        layer.bindPopup(desc);
        layer.bindTooltip(props.nome).openTooltip();
    }
} 

//Add Controls
var scaleOpts = {
    metric: true,
    imperial: false
};
L.control.scale(scaleOpts).addTo(map);