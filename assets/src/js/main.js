/*
  Autor: Ricardo Barbosa
  Email: ricardobcm@outlook.com
*/
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
    iconAnchor: [27, 68],
    popupAnchor: [-2, -61]
  }
}),

// Contadores
comerciosTotal = 0,
feirasTotal = 0,
produtoresTotal = 0;

const
comercioMarker = new MarkerIcon({ iconUrl: 'assets/images/comercio-marker.png' }),
feiraMarker = new MarkerIcon({ iconUrl: 'assets/images/feira-marker.png' }),
produtorMarker = new MarkerIcon({ iconUrl: 'assets/images/produtor-marker.png' }),
comercioMarkerSelected =  new MarkerIcon({ iconUrl: 'assets/images/comercio-marker-selected.png' }),
feiraMarkerSelected = new MarkerIcon({ iconUrl: 'assets/images/feira-marker-selected.png' }),
produtorMarkerSelected = new MarkerIcon({ iconUrl: 'assets/images/produtor-marker-selected.png' }),

iconMarkers = {
  'Comercio': comercioMarker,
  'Feira': feiraMarker,
  'Produtor': produtorMarker,
  'ComercioSelected': comercioMarkerSelected,
  'FeiraSelected': feiraMarkerSelected,
  'ProdutorSelected': produtorMarkerSelected
},

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
});

let //Cerca geográfica de visualizãção
northWest = L.latLng( -4.904886794837085, -43.18674087524414 ),
southEast = L.latLng( -5.332669664718695, -42.37615585327149 ),
bounds = L.latLngBounds( northWest, southEast );

//Adicão do mapa
let map = L.map('map', {
  center: [-5.1026, -42.8082],
  zoom: 11,
  //minZoom: 11,
  maxZoom: 18,
  zoomControl: false,
  closePopupOnClick: true,
  attributionControl: true
});

var source = L.WMS.source("http://localhost:8080/geoserver/the_organicos_ws/wms", {
    'transparent': true,
    'format':'image/png'
});
source.getLayer("bairro").addTo(map);

map.on('contextmenu', e => e);

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

///map.setMaxBounds( bounds );

//Unidade Produtoras
$.getJSON('unidadesProdutoras.php', data => {
  let geoJsonLayer = L.geoJson( data, {
    pointToLayer: ( feature, latlng ) => L.marker( latlng, {icon: iconMarkers[feature.properties.current_tipo], title: feature.properties.nome_unidade_produtora}),
    onEachFeature: bindPopup
  });

  produtoresLayerToControl.addTo( map );
  feirasLayerToControl.addTo( map );
  comercioLayerToControl.addTo( map );
  markersCluster.addTo( map );
});

const bindPopup = ( feature, layer ) => {
  let
  properties = feature.properties,
  description = '';
  feature.layer = layer;

  console.log(properties);

  description = `
  <div><strong><h3> ${properties.nome_unidade_produtora} <h3></strong></div>
  <div><strong>Telefone:</strong> ${properties.contato_unidade_produtora}</div>
  <div><strong>Funcionamento:</strong> ${properties.horario_funcionamento_unidade_produtora}</div>
  <div><strong>Descrição:</strong> ${properties.descricao_unidade_produtora}</div>`;

  layer.bindPopup( description );
  layer.on({
    mouseover : () => layer.setIcon(iconMarkers[`${properties.current_tipo}Selected`]),
    mouseout : () => layer.setIcon(iconMarkers[properties.current_tipo])
  });

  addLayerByType[properties.current_tipo]( layer );
},
//Agrupador de marcadores
markersCluster = L.markerClusterGroup({
  disableClusteringAtZoom: 13,
  showCoverageOnHover: true,
  spiderfyOnMaxZoom: false
});

const addLayerByType = {
  'Comercio': layer => {
    comercioLayer.addLayer( layer );
    comerciosTotal++;
  },
  'Feira': layer => {
    feirasLayer.addLayer( layer );
    feirasTotal++;
  },
  'Produtor': layer => {
    produtoresLayer.addLayer( layer );
    produtoresTotal++;
  }
};

const updateEventsOnMarkers = tag => {
  let 
  nome = null,
  icon = null;

  $( tag ).click( e => {
    nome = $(e.currentTarget).text();
    moveToPoint( markersCluster, nome );
  });

  $( tag ).hover( e => {
    nome = $(e.currentTarget).text();
    markersCluster.eachLayer( layer => {
      if ( layer.feature.properties.nome === nome ) {
        layer.setIcon(iconMarkers[`${layer.feature.properties.current_tipo}Selected`]);
      }
    });
  },
  () => {
    markersCluster.eachLayer( layer => {
      if ( layer.feature.properties.nome === nome ) {
        layer.setIcon(iconMarkers[layer.feature.properties.current_tipo]);
      }
    });
  });
};

map.on('layeradd ', e => {
  let layerName = stringLayerName(e.layer);
  if ( layerName ) {
    addRemoveLayerOfCluster[layerName]( true );
  }
});

map.on('layerremove', e => {
  let layerName = stringLayerName(e.layer);
  if ( layerName ) {
    addRemoveLayerOfCluster[layerName]( false );
  }
});

const addRemoveLayerOfCluster = {
  comercioLayerToControl: isToAdd => {
    isToAdd ? markersCluster.addLayer( comercioLayer ) : markersCluster.removeLayer( comercioLayer );
  },
  feirasLayerToControl: isToAdd => {
    isToAdd ? markersCluster.addLayer( feirasLayer ) : markersCluster.removeLayer( feirasLayer );
  },
  produtoresLayerToControl: isToAdd => {
    isToAdd ? markersCluster.addLayer( produtoresLayer ) : markersCluster.removeLayer( produtoresLayer );
  }
};

const stringLayerName = layer =>
  layer === comercioLayerToControl ? 'comercioLayerToControl' :
  layer === feirasLayerToControl ? 'feirasLayerToControl' : 
  layer === produtoresLayerToControl ? 'produtoresLayerToControl' : '';

$('#switch-produtor').on('change', e => $(e.currentTarget).is(':checked') ? map.addLayer( produtoresLayerToControl ) : map.removeLayer( produtoresLayerToControl ));
$('#switch-comercio').on('change', e => $(e.currentTarget).is(':checked') ? map.addLayer( comercioLayerToControl ) : map.removeLayer( comercioLayerToControl ));
$('#switch-feira').on('change', e => $(e.currentTarget).is(':checked') ? map.addLayer( feirasLayerToControl ) : map.removeLayer( feirasLayerToControl ));

// Busca em tempo real (Ajax search)
$('#search-input').keyup( () => {
  let
  searchField = $('#search-input').val(),
  regex = new RegExp( searchField, "i" ),
  listSearch = '',
  propertiesFound = [];
  if ( !searchField ) {
    document.getElementById('search-results').innerHTML = '';
  } else {
    markersCluster.eachLayer( layer => {
      if ( layer.feature.properties.nome_unidade_produtora.search(regex) != -1 && searchField && propertiesFound.length < 5 ){
        propertiesFound.push(layer.feature.properties.nome_unidade_produtora);
      }
    });
    propertiesFound.sort();
    propertiesFound.forEach( function(element, index) {
      listSearch += `<li class="list-group-item link-class"> ${element} </li>`;
    });
    document.getElementById('search-results').innerHTML = listSearch;
    propertiesFound.length = 0;
  }
});

$('#search-results').on('click', 'li', e => {
  let inputValue = $(e.currentTarget).text().trim();
  $('#search-input').val( inputValue );
  moveToPoint( markersCluster, inputValue );
  document.getElementById('search-results').innerHTML = '';
});

const moveToPoint = ( layerToSearch, name ) => {
  let 
  controle = true,// Variável evita mais de uma chamada ao 'zoomend' por vez 
  latlng;
  layerToSearch.eachLayer( layer => {
    if ( layer.feature.properties.nome_unidade_produtora === name ){
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

const openPopUp = name => {
  let desc = '';
  markersCluster.eachLayer( layer => {
    if ( layer.feature.properties.nome === name ){
      desc = `<div><strong> ${name} </strong><br/><br/></div>`;
      layer.bindPopup( desc ).openPopup();
    }
  });
};

const sortList = layerToSort => {
  let arrayTemp = [];
  layerToSort.eachLayer( layer => {
    arrayTemp.push( layer.feature.properties.nome );
  });
  return arrayTemp.sort();
};
