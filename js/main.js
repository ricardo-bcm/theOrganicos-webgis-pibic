/*
    Autor: Ricardo Barbosa
    Email: ricardobcm@outlook.com
*/

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
    minZoom: 7,
    maxZoom: 13 ,
    accessToken: accessToken
    });

//Adicão do mapa
var map = L.map('map', {
    center: [-5.1026, -42.8082],
    zoom: 11,
    minZoom: 11,
    maxZoom: 18,
    zoomControl: false,
    closePopupOnClick: true,
    attributionControl: true
});

map.on('contextmenu', function(e) {
    e.preventDefault();
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

// Layers de cada tipo
var produtoresLayerToControl = L.featureGroup(),
feirasLayerToControl = L.featureGroup(),
comercioLayerToControl = L.featureGroup();

controlLayers.addOverlay(produtoresLayerToControl, 'Produtores de Orgânicos');
controlLayers.addOverlay(feirasLayerToControl, 'Feiras de Orgânicos');
controlLayers.addOverlay(comercioLayerToControl, 'Comércio de Orgânicos');

var produtores = L.layerGroup();
var feiras = L.layerGroup();
var comercio = L.layerGroup();

var jsonData;

//Add data geoJson
/*$.getJSON('returnJsonOnly.php', function (data) {
    addGeoJsonLayerWithClustering(data);
    jsonData = data;
});*/


$(".filter-button").click(function(){
    $("#layers-type").toggle(400);
});


$.getJSON('data.geojson', function (data) {
    jsonData = data;
    geoJsonLayer = L.geoJson(data, {
        pointToLayer: function (feature, latlng) { 
            marker = null;  
            switch(feature.properties.current_tipo) {
                case 'Comercio' :
                    marker = L.marker(latlng, {icon: new MarkerIcon({iconUrl: comercioMarkerUrl})});
                    break;
                case 'Produtor' :
                    marker = L.marker(latlng, {icon: new MarkerIcon({iconUrl: produtorMarkerUrl})});
                    break;
                case 'Feira' :
                    marker = L.marker(latlng, {icon: new MarkerIcon({iconUrl: feiraMarkerUrl})});
                    break;
            }
            return marker;
        },
        onEachFeature: bindPopup
    });
    produtoresLayerToControl.addTo(map);
    feirasLayerToControl.addTo(map);
    comercioLayerToControl.addTo(map);
    markersCluster.addTo(map);
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

    switch (props.current_tipo) {
        case 'Comercio':
            comercio.addLayer(layer);
            break;
        case 'Feira':
            feiras.addLayer(layer);
            break;
        case 'Produtor' :
            produtores.addLayer(layer);
            break;
    }
} 


function sycronizeListMarkers() {
    document.getElementById('list-markers').innerHTML = '';
    var linePoint = '';
    markersCluster.eachLayer(function (layer) {
        linePoint += '<li class="list-group-item list-group-item-action">';
        linePoint += layer.feature.properties.nome;
        linePoint += '</li>';
    });
    $('#list-markers').append(linePoint);
}

function updateEventsOnMarkers() {
    $('#list-markers li').click(function() {
        nome = $(this).text();
        moveToPoint(nome);
    });

    $('#list-markers li').hover(function() {
        nome = $(this).text();
        markersCluster.eachLayer(function (layer) {
            if(layer.feature.properties.nome == nome){
                iconUrl = setIconUrlByTypeSelected(layer.feature.properties.current_tipo);
                layer.setIcon(new MarkerIcon({iconUrl: iconUrl}));
            }
        });
    },
    function() {
        markersCluster.eachLayer(function (layer) {
            if(layer.feature.properties.nome == nome){
                iconUrl = setIconUrlByType(layer.feature.properties.current_tipo);
                layer.setIcon(new MarkerIcon({iconUrl: iconUrl}));
            }
        });
    });
}

map.on('layeradd ', function(e) {
    if(e.layer === comercioLayerToControl) {
        markersCluster.addLayer(comercio);
    }
    if(e.layer === feirasLayerToControl) {
        markersCluster.addLayer(feiras);
    }
    if(e.layer === produtoresLayerToControl) {
        markersCluster.addLayer(produtores);
    }
    sycronizeListMarkers();
    updateEventsOnMarkers();
});

map.on('layerremove', function(e) {
    if(e.layer === comercioLayerToControl) {
        markersCluster.removeLayer(comercio);
    }
    if(e.layer === feirasLayerToControl) {
        markersCluster.removeLayer(feiras);
    }
    if(e.layer === produtoresLayerToControl) {
        markersCluster.removeLayer(produtores);
    }
    sycronizeListMarkers();
    updateEventsOnMarkers();
});


$('#switch-produtor').on('change', function(e) {
    if($(this).is(':checked')) {
        map.addLayer(produtoresLayerToControl);
    }  
    if($(this).is(':not(:checked)')) {
        map.removeLayer(produtoresLayerToControl);
    }
});

$('#switch-comercio').on('change', function(e) {
    if($(this).is(':checked')) {
        map.addLayer(comercioLayerToControl);
    }  
    if($(this).is(':not(:checked)')) {
        map.removeLayer(comercioLayerToControl);
    }
});

$('#switch-feira').on('change', function(e) {
    if($(this).is(':checked')) {
        map.addLayer(feirasLayerToControl);
    }  
    if($(this).is(':not(:checked)')) {
        map.removeLayer(feirasLayerToControl);
    }
});

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
    document.getElementById('results').innerHTML = '';
    var searchField = $('#search-input').val();
    var regex = new RegExp(searchField, "i");
    var count = 0;
    $.each(jsonData.features,function(index, el) {
        if(el.properties.nome.search(regex) != -1 && !isBlank(searchField) && count < 5  ){
            var listSearch = '';
                listSearch += '<li class="list-group-item link-class">';
                listSearch += '<img src="'+ setIconUrlByType(el.properties.current_tipo) +'" height="48px" width="41px" class="img-thumbnail">  ';
                listSearch += el.properties.nome;
                listSearch += '</li>';
            document.getElementById('results').innerHTML += listSearch;
            count++;
        }
    });
});

$('#results').on('click', 'li', function() {
    var click_txt = $(this).text().split('|');
    var inputValue = $.trim(click_txt[0]);
    $('#search-input').val(inputValue);
    moveToPoint(inputValue);
    document.getElementById('results').innerHTML = '';
});

function setIconUrlByType(tipo) {
    icon = '';
    switch(tipo) {
        case 'Comercio' :
            icon = comercioMarkerUrl;
            break;
        case 'Produtor' :
            icon = produtorMarkerUrl;
            break;
        case 'Feira' :
            icon = feiraMarkerUrl;
            break;
    }
    return icon;
}

function setIconUrlByTypeSelected(tipo) {
    icon = '';
    switch(tipo) {
        case 'Comercio' :
            icon = comercioMarkerUrlSelected;
            break;
        case 'Produtor' :
            icon = produtorMarkerUrlSelected;
            break;
        case 'Feira' :
            icon = feiraMarkerUrlSelected;
            break;
    }
    return icon;
}

function moveToPoint(name,) {
    var controle = 0;
    $.each(jsonData.features, function(index, el) {
        if(el.properties.nome == name){
            latlng = L.latLng(el.geometry.coordinates[1], el.geometry.coordinates[0]);

            map.flyTo(latlng,14);
          
            map.on('zoomend', function(e) {
                if(controle == 0) {
                    openPopUp(name); 
                }
                controle = 1;
            });
        }
    });
}

function openPopUp(name) {
    markersCluster.eachLayer(function (layer) {
        if(layer.feature.properties.nome == name){
            var desc = '<div class="row">';
                desc += '<div class="col-md-12"><strong>' + name + '</strong><br/><br/></div>';
                desc += '</div>';
            layer.bindPopup(desc).openPopup();
        }
    });
}

function isBlank(str) {
    return (!str || /^\s*$/.test(str));
}

