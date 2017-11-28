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

var miniMapOptions = {
    toggleDisplay: true,
    width : 120,
    height : 120
};

//Minimapa
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

var jsonData;

//Add data geoJson
/*$.getJSON('returnJsonOnly.php', function (data) {
    addGeoJsonLayerWithClustering(data);
    jsonData = data;
});*/

var produtores = L.layerGroup(),
    feiras = L.layerGroup(),
    comercio = L.layerGroup();

controlLayers.addOverlay(produtores, 'Produtores de Orgânicos');
controlLayers.addOverlay(feiras, 'Feiras de Orgânicos');
controlLayers.addOverlay(comercio, 'Comércio de Orgânicos');


$.getJSON('data.geojson', function (data) {
    addGeoJsonLayerWithClustering(data);
    jsonData = data;
});


//Marcadores
var MarkerIcon = L.Icon.extend({
    options: {
        shadowUrl: 'img/shadow.png',
        iconSize: [84, 71],
        iconAnchor: [24, 46],
        popupAnchor: [0, -44]
    }
});

var comercioMarkerUrl = 'img/comercio-marker.png',
    produtorMarkerUrl = 'img/produtor-marker.png',
    feiraMarkerUrl = 'img/feira-marker.png';

var comercioMarker = new MarkerIcon({iconUrl: comercioMarkerUrl}),
    produtorMarker = new MarkerIcon({iconUrl: produtorMarkerUrl}),
    feiraMarker = new MarkerIcon({iconUrl: feiraMarkerUrl});

var markersCluster = L.markerClusterGroup({
        disableClusteringAtZoom: 13,
        showCoverageOnHover: true,
        spiderfyOnMaxZoom: false
    });

//Agrupador de marcadores
function addGeoJsonLayerWithClustering(data) {
    geoJsonLayer = L.geoJson(data, {
        pointToLayer: function (feature, latlng) {
            props = feature.properties;
            if(props.current_tipo == 'Tipo Um'){
                return L.marker(latlng, {icon: comercioMarker});
            } else if (props.current_tipo == 'Tipo Dois'){
                return L.marker(latlng, {icon: produtorMarker});
            } else {
                return L.marker(latlng, {icon: feiraMarker});
            }
        },
        onEachFeature: bindPopup
    });
    markersCluster.addLayer(geoJsonLayer).addTo(map);
    controlLayers.addOverlay(markersCluster, 'Pontos');
}

function bindPopup(feature, layer) {
    feature.layer = layer;
    props = feature.properties;
    if(props.current_tipo == 'Tipo Dois'){
        comercio.addLayer(layer);
    } else {
        produtores.addLayer(layer);
    }
    if (props) {
        var desc = '<div class="row">';
            desc += '<div class="col-md-12"><strong>' + props.nome + '</strong><br/><br/></div>';
            desc += '</div>'; 

        layer.bindPopup(desc);
        layer.bindTooltip(props.nome).openTooltip();
    }
} 

var scaleOpts = {
    metric: true,
    imperial: false
};
L.control.scale(scaleOpts).addTo(map);


jsonAjaxSearch();

function jsonAjaxSearch(){
    $('#search-input').keyup(function(){
        $("#results").html('');
        var searchField = $('#search-input').val();
        var regex = new RegExp(searchField, "i");
        var count = 1;

        $.each(jsonData.features,function(index, el) {
            if(el.properties.nome.search(regex) != -1 && !isBlank(searchField)){
                var t = '';
                    t += '<li class="list-group-item link-class">';
                    t += '<img src="'+ setIconForSearch(el.properties.current_tipo) +'" height="80px" width="40px" class="img-thumbnail">  ';
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
}


function setIconForSearch(tipo) {
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

function moveToPoint(name) {
    $.each(jsonData.features, function(index, el) {
        if(el.properties.nome == name){
            var lon = el.geometry.coordinates[0],
                lat = el.geometry.coordinates[1];
                latlon = [lat,lon];
                
                map.flyTo(latlon,14);
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