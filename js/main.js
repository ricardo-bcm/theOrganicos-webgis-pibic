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

//Layer Control
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


$.getJSON('data.geojson', function (data) {
    addGeoJsonLayerWithClustering(data);
    jsonData = data;
});

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
            // desc += '<div class="col-md-12">Descrição' + '<br/>' + props.description + '<br/><br/></div>';    

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


function jsonAjax(){
    $('#search-input').keyup(function(){
        $("#results").html('');
        var searchField = $('#search-input').val();
        var regex = new RegExp(searchField, "i");
        var count = 1;

        $.each(jsonData.features,function(index, el) {
            if(el.properties.nome.search(regex) != -1 && !isBlank(searchField)){
                var t = '';
                    t += '<li class="list-group-item link-class"><img src="node_modules/leaflet/dist/images/marker-icon-2x.png" height="60px" width="20px" class="img-thumbnail">  ' + el.properties.nome + '</li>'
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

jsonAjax();


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


$('#ruas-radio').click(function() {
    changeToStreetLayer();
});

$('#satelitte-radio').click(function() {
   changeToSatelliteLayer();
});

function changeToStreetLayer() {
    layer = baseLayers['Satelite'];
    map.removeLayer(layer);
    baseLayers['Ruas'].addTo(map);
}

function changeToSatelliteLayer() {
     baseLayers['Satelite'].addTo(map);
}