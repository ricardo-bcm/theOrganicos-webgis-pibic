// Layers
var mapboxUrl = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}';
var accessToken = 'pk.eyJ1IjoicmljYXJkb2JjbSIsImEiOiJjajlrMTJkejQxaTUyMzNwZ3cxcnM3MDU2In0.pr0XFTVGiylyl6Sth57t9g';
var attrib = '<a href="http://openstreetmap.org">OpenStreetMap</a> | <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a> | <a href="http://mapbox.com">Mapbox</a>';

var streetsLayer = new L.TileLayer(mapboxUrl, {
    attribution: attrib,
    id: 'mapbox.streets',
    accessToken: accessToken,
    label: 'Estradas'
}),
    satelliteStreetLayer = new L.TileLayer(mapboxUrl, {
        attribution: attrib,
        id: 'mapbox.streets-satellite',
        accessToken: accessToken,
        label: 'Satélite'
    });

var streetsMinimap = new L.TileLayer(mapboxUrl, {
    attribution: attrib,
    id: 'mapbox.streets',
    minZoom: 8,
    maxZoom: 12,
    accessToken: accessToken
    });

//Adicão do mapa
var map = L.map('map', {
    center: [-5.1026, -42.8082],
    zoom: 12,
    minZoom: 12,
    maxZoom: 18,
    zoomControl: false,
    closePopupOnClick: true,
    attributionControl: true
});

//Minimapa
var miniMapOptions = {
    position: 'topright',
    toggleDisplay: true,
    width : 120,
    height : 120
};
var minimap = new L.Control.MiniMap(streetsMinimap, miniMapOptions).addTo(map);

//Botões de Zoom
var zoomHome = L.Control.zoomHome().addTo(map);

//Cerca geográfica de visualizãção
var northWest = L.latLng(-4.904886794837085, -43.18674087524414),
southEast = L.latLng(-5.332669664718695, -42.37615585327149),
bounds = L.latLngBounds(northWest, southEast);
map.setMaxBounds(bounds);

//Controle de camadas
var baseLayers = {
    "Ruas" : streetsLayer.addTo(map),
    "Satelite" : satelliteStreetLayer
};
var controlLayers = L.control.layers(baseLayers, null);

var basemaps = [
    streetsLayer,
    satelliteStreetLayer
];

map.addControl(L.control.basemaps({
    basemaps : basemaps,
    tileX: 0,
    tileY: 0,
    tileZ: 1
}));

var jsonData;

//Add data geoJson
/*$.getJSON('returnJsonOnly.php', function (data) {
    addGeoJsonLayerWithClustering(data);
    jsonData = data;
});*/

$.getJSON('data.geojson', function (data) {
    addGeoJsonLayerWithClustering(data);
    jsonData = data;
});


//Marcadores
var MarkerIcon = L.Icon.extend({
    options: {
        shadowUrl: 'img/shadow.png',
        iconSize: [84, 71],
        iconAnchor: [29, 63],
        popupAnchor: [3, -61]
    }
});

var comercioMarkerUrl = 'img/comercio-marker.png',
    produtorMarkerUrl = 'img/produtor-marker.png',
    feiraMarkerUrl = 'img/feira-marker.png',
    comercioMarkerUrlSelected = 'img/comercio-marker-selected.png',
    produtorMarkerUrlSelected = 'img/produtor-marker-selected.png',
    feiraMarkerUrlSelected = 'img/feira-marker-selected.png';

//Agrupador de marcadores
var markersCluster = L.markerClusterGroup({
        disableClusteringAtZoom: 13,
        showCoverageOnHover: true,
        spiderfyOnMaxZoom: false
    });

function addGeoJsonLayerWithClustering(data) {
    geoJsonLayer = L.geoJson(data, {
        pointToLayer: function (feature, latlng) { 
            marker = null;  
            switch(feature.properties.current_tipo) {
                case 'Tipo Um' :
                    marker = L.marker(latlng, {icon: new MarkerIcon({iconUrl: comercioMarkerUrl})});
                    break;
                case 'Tipo Dois' :
                    marker = L.marker(latlng, {icon: new MarkerIcon({iconUrl: produtorMarkerUrl})});
                    break;
                case 'Tipo Tres' :
                    marker = L.marker(latlng, {icon: new MarkerIcon({iconUrl: feiraMarkerUrl})});
                    break;
            }
            return marker;
        },
        onEachFeature: bindPopup
    });
    markersCluster.addLayer(geoJsonLayer).addTo(map);
    controlLayers.addOverlay(markersCluster, 'Pontos');
}

function bindPopup(feature, layer) {
    feature.layer = layer;
    props = feature.properties;
    if (props) {
        var description = '<div class="row">';
            description += '<div class="col-md-12"><strong>' + props.nome + '</strong><br/><br/></div>';
            description += '</div>'; 

        layer.bindPopup(description);
        layer.bindTooltip(props.nome).openTooltip();
    }
    var linePoint = '<li class="list-group-item list-group-item-action">';
        linePoint += props.nome;
        linePoint += '</li>';
    $('#list-markers').append(linePoint);
} 

// Informações
var latLngOpts = {
    separator: ' [] ',
    emptyString: 'Latitude [] Longitude'
};
L.control.mousePosition(latLngOpts).addTo(map);

var scaleOpts = {
    metric: true,
    imperial: false
};
L.control.scale(scaleOpts).addTo(map);

// Busca em tempo real (Ajax search)
$('#search-input').keyup(function(){
    $("#results").html('');
    var searchField = $('#search-input').val();
    var regex = new RegExp(searchField, "i");
    var count = 1;
    $.each(jsonData.features,function(index, el) {
        if(el.properties.nome.search(regex) != -1 && !isBlank(searchField)){
            var t = '';
                t += '<li class="list-group-item link-class">';
                t += '<img src="'+ setIconUrlByType(el.properties.current_tipo) +'" height="48px" width="41px" class="img-thumbnail">  ';
                t += el.properties.nome;
                t += '</li>';
            $('#results').append(t);
        }
    });
});

$('#results').on('click', 'li', function() {
    var click_txt = $(this).text().split('|');
    var inputValue = $.trim(click_txt[0]);
    $('#search-input').val(inputValue);
    moveToPoint(inputValue);
    $("#results").html('');
});

function setIconUrlByType(tipo) {
    icon = '';
    switch(tipo) {
        case 'Tipo Um' :
            icon = comercioMarkerUrl;
            break;
        case 'Tipo Dois' :
            icon = produtorMarkerUrl;
            break;
        case 'Tipo Tres' :
            icon = feiraMarkerUrl;
            break;
    }
    return icon;
}

function setIconUrlByTypeSelected(tipo) {
    icon = '';
    switch(tipo) {
        case 'Tipo Um' :
            icon = comercioMarkerUrlSelected;
            break;
        case 'Tipo Dois' :
            icon = produtorMarkerUrlSelected;
            break;
        case 'Tipo Tres' :
            icon = feiraMarkerUrlSelected;
            break;
    }
    return icon;
}

function moveToPoint(name) {
    $.each(jsonData.features, function(index, el) {
        if(el.properties.nome == name){
            latlng = L.latLng(el.geometry.coordinates[1], el.geometry.coordinates[0]);

                var desc = '<div class="row">';
                    desc += '<div class="col-md-12"><strong>' + el.properties.nome + '</strong><br/><br/></div>';
                    desc += '</div>';

                markersCluster.eachLayer(function (layer) {
                    if(layer.feature.properties.nome == name){
                        layer.bindPopup(desc).openPopup();
                    }
                });                
                map.flyTo(latlng,14);
        }        
    });
}

function isBlank(str) {
    return (!str || /^\s*$/.test(str));
}

$('#select-layer').change(function() {
    option = $('#select-layer').val();
    switch(option) {
        case '1' :
            changeToStreetLayer();
            break;
        case '2' :
            changeToSatelliteLayer();
            break;
    }
});

function changeToStreetLayer() {
    layer = baseLayers['Satelite'];
    map.removeLayer(layer);
    baseLayers['Ruas'].addTo(map);
}

function changeToSatelliteLayer() {
     baseLayers['Satelite'].addTo(map);
}

var prdo

$(function() {
  $('#list-markers li').hover(function() {
      nome = $(this).text();
      markersCluster.eachLayer(function (layer) {
          if(layer.feature.properties.nome == nome){
            iconUrl = setIconUrlByTypeSelected(layer.feature.properties.current_tipo);
            layer.setIcon(new MarkerIcon({iconUrl: iconUrl}));
          }
      });

  }, function() {
        markersCluster.eachLayer(function (layer) {
            if(layer.feature.properties.nome == nome){
                iconUrl = setIconUrlByType(layer.feature.properties.current_tipo);
                layer.setIcon(new MarkerIcon({iconUrl: iconUrl}));
            }
        });
  });
});
