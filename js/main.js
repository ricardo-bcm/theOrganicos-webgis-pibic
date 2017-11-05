// Layers
var mapboxUrl = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}';
var accessToken = 'pk.eyJ1IjoicmljYXJkb2JjbSIsImEiOiJjajlrMTJkejQxaTUyMzNwZ3cxcnM3MDU2In0.pr0XFTVGiylyl6Sth57t9g';
var attrib = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>';

var streetsLayer = new L.TileLayer(mapboxUrl, {
    minZoom: 1,
    maxZoom: 28,
    attribution: attrib,
    id: 'mapbox.streets',
    accessToken: accessToken
}),
satelliteLayer = new L.TileLayer(mapboxUrl, {
    minZoom: 1,
    maxZoom: 28,
    attribution: attrib,
    id: 'mapbox.streets-satellite',
    accessToken: accessToken
});

var map = L.map('map',{
    center: [-5.1026, -42.8082],
    zoom: 12,
    minZoom:1,
    maxZoom:28,
    closePopupOnClick:true,
    attributionControl: true
});

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
    showResultFct: function(feature, container) {
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
    "Satelite" : satelliteLayer
};
var controlLayers = L.control.layers(baseLayers,null).addTo(map);


//Add data geoJson
$.getJSON('returnJsonOnly.php',function (data) {
    addGeoJsonLayerWithClustering(data);
    searchCtrl.indexFeatures(data.features,['nome']);
});


// Simple Markers
function addGeoJsonLayerMarkers(data) {
    var markers = L.geoJSON(false,{
    onEachFeature: function (feature, layer) {
        feature.layer = layer;
        layer.bindPopup(feature.properties.nome);
    }
});
    markers.addData(data).addTo(map);
    controlLayers.addOverlay(markers, 'Pontos');
}

// Markers Cluster
function addGeoJsonLayerWithClustering(data) {
      var markersCluster = L.markerClusterGroup({
        disableClusteringAtZoom: 13,
        showCoverageOnHover: true,
        spiderfyOnMaxZoom: false
      });
      var geoJsonLayer = L.geoJson(data, {
          onEachFeature: bindPopup
      });
        markersCluster.addLayer(geoJsonLayer).addTo(map);
        controlLayers.addOverlay(markersCluster, 'Pontos');
  }

function bindPopup(feature, layer) {
      feature.layer = layer;
      props = feature.properties;
      if(props){
        var description = '<div id="pop"></div>';
        description += '<strong>' + props.nome + '</strong><br/><br/>';
        description += '<img src="images/tree.png"/>';

        layer.bindPopup(description);
      }
  }  

map.on('click', function(e) {
    alert("Lon, Lat : " + e.latlng.lng + " " + e.latlng.lat)
});  


//Add Controls
var scaleOpts = {
    metric: true,
    imperial: false,
}
L.control.scale(scaleOpts).addTo(map);