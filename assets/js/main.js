/*
	Autor: Ricardo Barbosa
	Email: ricardobcm@outlook.com
*/
/*jshint esversion: 6 */
var
jsonData,
mapboxUrl = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}',
accessToken = 'pk.eyJ1IjoicmljYXJkb2JjbSIsImEiOiJjajlrMTJkejQxaTUyMzNwZ3cxcnM3MDU2In0.pr0XFTVGiylyl6Sth57t9g',
attrib = '<a href="http://openstreetmap.org">OpenStreetMap</a> | <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a> | <a href="http://mapbox.com">Mapbox</a>',
// Layers
streetsLayer = new L.TileLayer( mapboxUrl, {
	attribution: attrib,
	id: 'mapbox.streets',
	accessToken: accessToken,
	label: 'Estradas'
}),
satelliteStreetLayer = new L.TileLayer( mapboxUrl, {
	attribution: attrib,
	id: 'mapbox.streets-satellite',
	accessToken: accessToken,
	label: 'Satélite'
}),
//Adicão do mapa
map = L.map('map', {
	center: [-5.1026, -42.8082],
	zoom: 11,
	minZoom: 11,
	maxZoom: 18,
	zoomControl: false,
	closePopupOnClick: true,
	attributionControl: true
});

map.on('contextmenu', function ( e ) {
	e.preventDefault();
});

// Controles
L.Control.zoomHome().addTo( map );

var //Minimapa
streetsMinimapLayer = new L.TileLayer( mapboxUrl, {
	attribution: attrib,
	id: 'mapbox.streets',
	minZoom: 7,
	maxZoom: 13,
	accessToken: accessToken
}),
miniMapOptions = {
	position: 'topright',
	toggleDisplay: true,
	width : 120,
	height : 120,
	strings: {
		hideText: 'Esconder minimapa',
		showText: 'Exibir minimapa'
	}
};
new L.Control.MiniMap( streetsMinimapLayer, miniMapOptions ).addTo( map );

var // Basemaps Switch
basemapsOptions = {
	basemaps: [streetsLayer, satelliteStreetLayer],
	tileX: 0,
	tileY: 0,
	tileZ: 1
};
L.control.basemaps( basemapsOptions ).addTo( map );

var
latLngOptions = {
	separator: ' [] ',
	emptyString: 'Latitude [] Longitude'
};
L.control.mousePosition( latLngOptions ).addTo( map );

var
scaleOptions = {
	metric: true,
	imperial: false
};
L.control.scale( scaleOptions ).addTo( map );

var //Cerca geográfica de visualizãção
northWest = L.latLng( -4.904886794837085, -43.18674087524414 ),
southEast = L.latLng( -5.332669664718695, -42.37615585327149 ),
bounds = L.latLngBounds( northWest, southEast );
map.setMaxBounds( bounds ),
//Layers para controlar a inserção/remoção dos layers no cluster
produtoresLayerToControl = L.featureGroup(),
feirasLayerToControl = L.featureGroup(),
comercioLayerToControl = L.featureGroup(),
produtoresLayer = L.layerGroup(),
feirasLayer = L.layerGroup(),
comercioLayer = L.layerGroup(),
//Icones para os marcadores
MarkerIcon = L.Icon.extend({
	options: {
		shadowUrl: 'assets/img/shadow.png',
		iconSize: [84, 71],
		iconAnchor: [29, 63],
		popupAnchor: [3, -61]
	}
}),
comercioMarkerIcon = new MarkerIcon({ iconUrl: 'assets/img/comercio-marker.png' }),
feiraMarkerIcon = new MarkerIcon({ iconUrl: 'assets/img/feira-marker.png' }),
produtorMarkerIcon = new MarkerIcon({ iconUrl: 'assets/img/produtor-marker.png' }),
comercioMarkerIconSelected = new MarkerIcon({ iconUrl: 'assets/img/comercio-marker-selected.png' }),
feiraMarkerIconSelected = new MarkerIcon({ iconUrl: 'assets/img/feira-marker-selected.png' }),
produtorMarkerIconSelected = new MarkerIcon({ iconUrl: 'assets/img/produtor-marker-selected.png' }),
// Contadores
comerciosTotal = 0,
feirasTotal = 0,
produtoresTotal = 0; /*jshint ignore:line*/

$.getJSON('data.geojson', function( data ) {
	jsonData = data;
	var geoJsonLayer = L.geoJson( data, {
		pointToLayer: function( feature, latlng ) {
			switch (feature.properties.current_tipo) {
				case 'Comercio':
					marker = L.marker( latlng, {icon: comercioMarkerIcon, title: feature.properties.nome} );
					comerciosTotal += 1;
					break;
				case 'Produtor':
					marker = L.marker( latlng, {icon: produtorMarkerIcon, title: feature.properties.nome} );
					produtoresTotal += 1;
					break;
				case 'Feira':
					marker = L.marker( latlng, {icon: feiraMarkerIcon, title: feature.properties.nome} );
					feirasTotal += 1;
					break;
			}
			return marker;
		},
		onEachFeature: bindPopup
	});
	document.getElementById('totalProdutores').innerHTML = '(' + produtoresTotal + ')';
	document.getElementById('totalComercios').innerHTML = '(' + comerciosTotal + ')';
	document.getElementById('totalFeiras').innerHTML = '(' + feirasTotal + ')';
	produtoresLayerToControl.addTo( map );
	feirasLayerToControl.addTo( map );
	comercioLayerToControl.addTo( map );
	markersCluster.addTo( map );
});

function bindPopup( feature, layer ) {
	var
	props = feature.properties,
	description = '',
	icon = null;
	feature.layer = layer;

	if ( props ) {
		description = '<div><strong>' + props.nome + '</strong></div>';
		layer.bindPopup( description );
		layer.on({
			mouseover : function(e) {
				icon = getSelectedIconByType( layer.feature.properties.current_tipo );
				layer.setIcon(icon);
			},
			mouseout : function(e) {
				icon = getIconByType( layer.feature.properties.current_tipo );
				layer.setIcon(icon);
			}
		});

		switch ( props.current_tipo ) {
			case 'Comercio':
				comercioLayer.addLayer( layer );
				break;
			case 'Feira':
				feirasLayer.addLayer( layer );
				break;
			case 'Produtor':
				produtoresLayer.addLayer( layer );
				break;
		}
	}
}

var //Agrupador de marcadores
markersCluster = L.markerClusterGroup({
	disableClusteringAtZoom: 13,
	showCoverageOnHover: true,
	spiderfyOnMaxZoom: false
});

function sycronizeListMarkers() {
	var
	linePoint = '',
	markerNames = [];
	document.getElementById('list-markers').innerHTML = '';
	markersCluster.eachLayer(function ( layer ) {
		markerNames.push( layer.feature.properties.nome );
	});
	markerNames.sort();
	for ( var i = 0, markerName; markerName = markerNames[i]; i++ ) {/*jshint ignore:line*/
		linePoint += '<li class="list-group-item list-group-item-action">';
		linePoint += markerName;
		linePoint += '</li>';
	}
	$('#list-markers').append( linePoint );
}

function updateEventsOnMarkers() {
	var nome = null;
	$('#list-markers li').click(function () {
		nome = $(this).text();
		moveToPoint( nome );
	});

	$('#list-markers li').hover(function () {
		nome = $(this).text();
		markersCluster.eachLayer(function ( layer ) {
			if ( layer.feature.properties.nome === nome ) {
				icon = getSelectedIconByType( layer.feature.properties.current_tipo );
				layer.setIcon( icon );
			}
		});
	},
		function () {
			markersCluster.eachLayer(function ( layer ) {
				if ( layer.feature.properties.nome === nome ) {
					icon = getIconByType( layer.feature.properties.current_tipo );
					layer.setIcon( icon );
				}
			});
		});
}

map.on('layeradd ', function( e ) {
	if ( e.layer === comercioLayerToControl ) {
		markersCluster.addLayer( comercioLayer );
	}
	if ( e.layer === feirasLayerToControl ) {
		markersCluster.addLayer( feirasLayer );
	}
	if ( e.layer === produtoresLayerToControl ) {
		markersCluster.addLayer( produtoresLayer );
	}
	sycronizeListMarkers();
	updateEventsOnMarkers();
});

map.on('layerremove', function( e ) {
	if ( e.layer === comercioLayerToControl ) {
		markersCluster.removeLayer( comercioLayer );
	}
	if ( e.layer === feirasLayerToControl ) {
		markersCluster.removeLayer( feirasLayer );
	}
	if ( e.layer === produtoresLayerToControl ) {
		markersCluster.removeLayer( produtoresLayer );
	}
	sycronizeListMarkers();
	updateEventsOnMarkers();
});

$('#switch-produtor').on('change', function( e ) {
	if ( $(this).is(':checked') ) {
		map.addLayer( produtoresLayerToControl );
	}
	if ( $(this).is(':not(:checked)') ) {
		map.removeLayer( produtoresLayerToControl );
	}
});

$('#switch-comercio').on('change', function( e ) {
	if ( $(this).is(':checked') ) {
		map.addLayer( comercioLayerToControl );
	}
	if ( $(this).is(':not(:checked)') ) {
		map.removeLayer( comercioLayerToControl );
	}
});

$('#switch-feira').on('change', function( e ) {
	if ( $(this).is(':checked') ) {
		map.addLayer( feirasLayerToControl );
	}
	if ( $(this).is(':not(:checked)') ) {
		map.removeLayer( feirasLayerToControl );
	}
});

// Busca em tempo real (Ajax search)
$('#search-input').keyup(function(){
	var
	searchField = $('#search-input').val(),
	regex = new RegExp( searchField, "i" ),
	count = 0;
	document.getElementById('search-results').innerHTML = '';
	$.each( jsonData.features,function ( index, element ) {
		if ( element.properties.nome.search(regex) != -1 && searchField && count < 5 ){
			var
			listSearch = '';
			listSearch += '<li class="list-group-item link-class">';
			listSearch += element.properties.nome;
			listSearch += '</li>';
			document.getElementById('search-results').innerHTML += listSearch;
			count++;
		}
	});
});

$('#search-results').on('click', 'li', function() {
	var
	click_txt = $(this).text().split('|'),
	inputValue = $.trim(click_txt[0]);
	$('#search-input').val( inputValue );
	moveToPoint( inputValue );
	document.getElementById('search-results').innerHTML = '';
});

function getIconByType( tipo ) {
	var icon = null;
	switch( tipo ) {
		case 'Comercio':
			icon = comercioMarkerIcon;
			break;
		case 'Produtor':
			icon = produtorMarkerIcon;
			break;
		case 'Feira':
			icon = feiraMarkerIcon;
			break;
	}
	return icon;
}

function getSelectedIconByType( tipo ) {
	var icon = null;
	switch(tipo) {
		case 'Comercio':
			icon = comercioMarkerIconSelected;
			break;
		case 'Produtor':
			icon = produtorMarkerIconSelected;
			break;
		case 'Feira':
			icon = feiraMarkerIconSelected;
			break;
	}
	return icon;
}

function moveToPoint( name ) {
	var //Variável evita mais de uma chamada ao 'zoomend' por vez 
	controle = 0,
	latlng;
	$.each( jsonData.features, function( index, element ) {
		if ( element.properties.nome == name ){
			latlng = L.latLng(element.geometry.coordinates[1], element.geometry.coordinates[0]);
			map.flyTo( latlng,14 );
			map.on('zoomend', function( e ) {
				if ( controle == 0 ) {
					openPopUp( name ); 
				}
				controle = 1;
			});
		}
	});
}

function openPopUp( name ) {
	var desc = '';
	markersCluster.eachLayer(function ( layer ) {
		if ( layer.feature.properties.nome == name ){
			desc = '<div><strong>' + name + '</strong><br/><br/></div>';
			layer.bindPopup( desc ).openPopup();
		}
	});
}
