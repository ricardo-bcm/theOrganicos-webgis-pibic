/*
	Autor: Ricardo Barbosa
	Email: ricardobcm@outlook.com
*/
/*jshint esversion: 6 */
let
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

map.on('contextmenu', ( e ) => {
	e.preventDefault();
});

// Controles
L.Control.zoomHome().addTo( map );

let //Minimapa
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

let // Basemaps Switch
basemapsOptions = {
	basemaps: [streetsLayer, satelliteStreetLayer],
	tileX: 0,
	tileY: 0,
	tileZ: 1
};
L.control.basemaps( basemapsOptions ).addTo( map );

let
latLngOptions = {
	separator: ' [] ',
	emptyString: 'Latitude [] Longitude'
};
L.control.mousePosition( latLngOptions ).addTo( map );

let
scaleOptions = {
	metric: true,
	imperial: false
};
L.control.scale( scaleOptions ).addTo( map );

let //Cerca geográfica de visualizãção
northWest = L.latLng( -4.904886794837085, -43.18674087524414 ),
southEast = L.latLng( -5.332669664718695, -42.37615585327149 ),
bounds = L.latLngBounds( northWest, southEast );
map.setMaxBounds( bounds );

let //Layers para controlar a inserção/remoção dos layers no cluster
produtoresLayerToControl = L.featureGroup(),
feirasLayerToControl = L.featureGroup(),
comercioLayerToControl = L.featureGroup(),
produtoresLayer = L.layerGroup(),
feirasLayer = L.layerGroup(),
comercioLayer = L.layerGroup(),

//Icones para os marcadores
MarkerIcon = L.Icon.extend({
	options: {
		shadowUrl: 'assets/images/shadow.png',
		iconSize: [54, 71],
		iconAnchor: [29, 63],
		popupAnchor: [-2, -61]
	}
}),

// Contadores
comerciosTotal = 0,
feirasTotal = 0,
produtoresTotal = 0; /*jshint ignore:line*/

let 
iconMarkers = [
	['Comercio' , new MarkerIcon({ iconUrl: 'assets/images/comercio-marker.png' })],
	['Feira' , new MarkerIcon({ iconUrl: 'assets/images/feira-marker.png' })],
	['Produtor', new MarkerIcon({ iconUrl: 'assets/images/produtor-marker.png' })],
	['ComercioSelected' , new MarkerIcon({ iconUrl: 'assets/images/comercio-marker-selected.png' })],
	['FeiraSelected' , new MarkerIcon({ iconUrl: 'assets/images/feira-marker-selected.png' })],
	['ProdutorSelected' , new MarkerIcon({ iconUrl: 'assets/images/produtor-marker-selected.png' })]
],
iconMarkersMap = new Map(iconMarkers);

$.getJSON('data.geojson', ( data ) => {
	let geoJsonLayer = L.geoJson( data, {
		pointToLayer: ( feature, latlng ) => {
			return L.marker( latlng, {icon: iconMarkersMap.get(feature.properties.current_tipo), title: feature.properties.nome} );
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

let bindPopup = ( feature, layer ) => {
	let
	props = feature.properties,
	description = '',
	icon = null;
	feature.layer = layer;

	if ( props ) {
		description = `<div><strong> ${props.nome} </strong></div>`;
		layer.bindPopup( description );
		layer.on({
			mouseover : () => {
				icon =  iconMarkersMap.get( `${layer.feature.properties.current_tipo}Selected` );
				layer.setIcon(icon);
			},
			mouseout : () => {
				icon = iconMarkersMap.get( layer.feature.properties.current_tipo );
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
},
//Agrupador de marcadores
markersCluster = L.markerClusterGroup({
	disableClusteringAtZoom: 13,
	showCoverageOnHover: true,
	spiderfyOnMaxZoom: false
});

let sycronizeListMarkers = () => {
	let
	linePoint = '',
	markerNames = sortList(markersCluster);
	document.getElementById('list-markers').innerHTML = '';

	for ( let i = 0, markerName; markerName = markerNames[i]; i++ ) {/*jshint ignore:line*/
		linePoint += `<li class="list-group-item list-group-item-action">${markerName}</li>`;
	}
	$('#list-markers').append( linePoint );
}

let updateEventsOnMarkers = () => {
	let 
	nome = null,
	icon = null;
	$('#list-markers li').click( ( e ) => {
		nome = $(e.currentTarget).text();
		moveToPoint( markersCluster, nome );
	});

	$('#list-markers li').hover( ( e ) => {
		nome = $(e.currentTarget).text();
		markersCluster.eachLayer( ( layer ) => {
			if ( layer.feature.properties.nome === nome ) {
				icon =  iconMarkersMap.get( `${layer.feature.properties.current_tipo}Selected` );
				layer.setIcon(icon);
			}
		});
	},
		() => {
			markersCluster.eachLayer( ( layer ) => {
				if ( layer.feature.properties.nome === nome ) {
					icon = iconMarkersMap.get( layer.feature.properties.current_tipo );
					layer.setIcon(icon);
				}
			});
		});
}

map.on('layeradd ', ( e ) => {
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

map.on('layerremove', ( e ) => {
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

$('#switch-produtor').on('change', ( e ) => {
	if ( $(e.currentTarget).is(':checked') ) {
		map.addLayer( produtoresLayerToControl );
	}
	if ( $(e.currentTarget).is(':not(:checked)') ) {
		map.removeLayer( produtoresLayerToControl );
	}
});

$('#switch-comercio').on('change', ( e ) => {
	if ( $(e.currentTarget).is(':checked') ) {
		map.addLayer( comercioLayerToControl );
	}
	if ( $(e.currentTarget).is(':not(:checked)') ) {
		map.removeLayer( comercioLayerToControl );
	}
});

$('#switch-feira').on('change', ( e ) => {
	if ( $(e.currentTarget).is(':checked') ) {
		map.addLayer( feirasLayerToControl );
	}
	if ( $(e.currentTarget).is(':not(:checked)') ) {
		map.removeLayer( feirasLayerToControl );
	}
});

// Busca em tempo real (Ajax search)
$('#search-input').keyup( () => {
	let
	searchField = $('#search-input').val(),
	regex = new RegExp( searchField, "i" ),
	count = 0,
	listSearch = '';
	if (searchField === '') {
		document.getElementById('search-results').innerHTML = '';
		return;
	}
	markersCluster.eachLayer( ( layer ) => {
		if ( layer.feature.properties.nome.search(regex) != -1 && searchField && count < 5 ){
			listSearch += `<li class="list-group-item link-class"> ${layer.feature.properties.nome} </li>`;
			count++;
		}
		document.getElementById('search-results').innerHTML = listSearch;
	});
});

$('#search-results').on('click', 'li', ( e ) => {
	let inputValue = $(e.currentTarget).text().trim();
	$('#search-input').val( inputValue );
	moveToPoint( markersCluster, inputValue );
	document.getElementById('search-results').innerHTML = '';
});

let moveToPoint = ( layerToSearch, name ) => {
	let // Variável evita mais de uma chamada ao 'zoomend' por vez 
	controle = true,
	latlng;
	layerToSearch.eachLayer( ( layer ) => {
		if ( layer.feature.properties.nome === name ){
			latlng = L.latLng( layer.feature.geometry.coordinates[1], layer.feature.geometry.coordinates[0] );
			map.flyTo( latlng,14 );
			map.on('zoomend', () => {
				if ( controle ) {
					openPopUp( name ); 
					controle = false;
				}
			});
		}
	});
};

let openPopUp = ( name ) => {
	let desc = '';
	markersCluster.eachLayer( ( layer ) => {
		if ( layer.feature.properties.nome === name ){
			desc = '<div><strong>' + name + '</strong><br/><br/></div>';
			layer.bindPopup( desc ).openPopup();
		}
	});
};

let sortList = ( layer ) => {
	let arrayTemp = [];
	layer.eachLayer( ( layer ) => {
		arrayTemp.push( layer.feature.properties.nome );
	});
	return arrayTemp.sort();
};
