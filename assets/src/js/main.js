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
bairrosLayer = L.layerGroup();

//Agrupador de marcadores
let
markersCluster = L.markerClusterGroup({
  disableClusteringAtZoom: 13,
  showCoverageOnHover: true,
  spiderfyOnMaxZoom: false
});

//Icones para os marcadores
let
MarkerIcon = L.Icon.extend({
  options: {
    shadowUrl: 'assets/images/shadow.png',
    iconSize: [54, 71],
    iconAnchor: [27, 68],
    popupAnchor: [-2, -61]
  }
});

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
};

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
});

let //Cerca geográfica de visualizãção
northWest = L.latLng( -4.904886794837085, -43.18674087524414 ),
southEast = L.latLng( -5.332669664718695, -42.37615585327149 ),
bounds = L.latLngBounds( northWest, southEast );

//Adicão do mapa
let map = L.map('map', {
  center: [-5.1026, -42.8082],
  zoom: 11,
  minZoom: 11,
  maxZoom: 18,
  zoomControl: false,
  closePopupOnClick: true,
  attributionControl: true
});


let mySource = L.WMS.Source.extend({
    'showFeatureInfo': function(latlng, info) {
        //Do nothing
    }
});

//Zona rural
/*let source = new mySource("http://localhost:8080/geoserver/the_organicos_ws/wms", {
    'transparent': true,
    'format':'image/png'
});
let zonaRuralLayer = source.getLayer("zona_rural");
zonaRuralLayer.addTo(map);*/

map.on('contextmenu', e => e);
map.scrollWheelZoom.disable();

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
  separator: ' | ',
  emptyString: 'Latitude [] Longitude'
};
L.control.mousePosition( latLngOptions ).addTo( map );

let
scaleOptions = {
  metric: true,
  imperial: false
};
L.control.scale( scaleOptions ).addTo( map );

let bairroEstilo = {
    "color": "#000000",
    "weight": 1.0,
    "opacity": 0.0,
    "fillOpacity": 0.0
};

let bairroDestaqueEstilo = {
    "color": "#7ABA7A",
    "weight": 5,
    "opacity": 0.80,
};

const bindBairrosPopUp = (feature, layer ) => {
  let properties = feature.properties;
  layer.bindPopup(properties.nome);
  layer.on({
    click: e => {
      let lay = e.target;
      //lay.setStyle(bairroDestaqueEstilo);
    }
  })
}

const load = callback => {
    $.getJSON('assets/dbscripts/feiras.php', data => {
    let geoJsonFeiraLayer = L.geoJson( data, {
      pointToLayer: ( feature, latlng ) => L.marker( latlng, {icon: iconMarkers[feature.properties.current_tipo], title: feature.properties.nome_feira}),
      onEachFeature: bindPopup
    });
  });
  $.getJSON('assets/dbscripts/unidadesProdutoras.php', data => {
    let geoJsonFeiraLayer = L.geoJson( data, {
      pointToLayer: ( feature, latlng ) => L.marker( latlng, {icon: iconMarkers[feature.properties.current_tipo], title: feature.properties.nome_unidade_produtora}),
      onEachFeature: bindPopup
    });
  });
  $.getJSON('assets/dbscripts/comercios.php', data => {
    let geoJsonFeiraLayer = L.geoJson( data, {
      pointToLayer: ( feature, latlng ) => L.marker( latlng, {icon: iconMarkers[feature.properties.current_tipo], title: feature.properties.nome_fantasia}),
      onEachFeature: bindPopup
    });
  });
  $.getJSON('assets/dbscripts/bairros.php', data => {
    let bairrosGeoJsonLayer = L.geoJson( data , {
      onEachFeature: bindBairrosPopUp,
      style: bairroEstilo  
    });

    bairrosLayer = bairrosGeoJsonLayer;

    bairrosLayer.addTo(map);
  });

  callback();
}

const putThemOnMap = () => {
  produtoresLayerToControl.addTo( map );
  feirasLayerToControl.addTo( map );
  comercioLayerToControl.addTo( map );
  markersCluster.addTo( map );
}

const bindPopup = ( feature, layer ) => {
  let
  properties = feature.properties,
  description = '';
  feature.layer = layer;

  if (properties.current_tipo === 'Produtor') {
      description += `
      <div><strong><h3> ${properties.nome} <h3></strong></div>
      <div><strong>Telefone:</strong> ${properties.contato_unidade_produtora}</div>
      <div><strong>Funcionamento:</strong> ${properties.horario_funcionamento_unidade_produtora}</div>
      <div><strong>Descrição:</strong> ${properties.descricao_unidade_produtora}</div>
      <div>`;
  } else if (properties.current_tipo === 'Feira') {
      description += `
      <div><strong><h3> ${properties.nome} <h3></strong></div>
      <div><strong>Telefone:</strong> ${properties.contato_feira}</div>
      <div><strong>Funcionamento:</strong> ${properties.horario_funcionamento}</div>
      <div><strong>Endereço:</strong> ${properties.endereco_feira}</div>
      <div>`;
  } else if (properties.current_tipo === 'Comercio') {
      description += `
      <div><strong><h3> ${properties.nome} <h3></strong></div>
      <div><strong>Telefone:</strong> ${properties.contato_comercio}</div>
      <div><strong>Cnpf:</strong> ${properties.cnpj_comercio}</div>
      <div><strong>Descrição:</strong> ${properties.descricao_comercio}</div>
      <div>`;
  }

    description += `<h4>Produtos</h4>`;
    for (let i = properties.produtos.length - 1; i >= 0; i--) {
      description += `${properties.produtos[i]} ,`;
    }

  description += `</div>`;

  layer.bindPopup( description );
  layer.on({
    mouseover : () => layer.setIcon(iconMarkers[`${properties.current_tipo}Selected`]),
    mouseout : () => layer.setIcon(iconMarkers[properties.current_tipo])
  });

  addLayerByType[properties.current_tipo]( layer );

  map.removeLayer( produtoresLayerToControl );
  map.addLayer( produtoresLayerToControl );
  map.removeLayer( feirasLayerToControl );
  map.addLayer( feirasLayerToControl );
  map.removeLayer( comercioLayerToControl );
  map.addLayer( comercioLayerToControl );
};

load(putThemOnMap);

const addLayerByType = {
  'Comercio': layer => {
    comercioLayer.addLayer( layer );
  },
  'Feira': layer => {
    feirasLayer.addLayer( layer );
  },
  'Produtor': layer => {
    produtoresLayer.addLayer( layer );
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

// Busca geral
$('#search-all-input').keyup( () => {
  let
  searchField = $('#search-all-input').val(),
  regex = new RegExp( searchField, "i" ),
  listSearch = '',
  placesAndProducts = [],
  neighborhoods = [],
  allFound = [];
  highlightForSearch(placesAndProducts, markersCluster);
  if ( !searchField ) {
    document.getElementById('search-all-results').innerHTML = '';
  } else {
    markersCluster.eachLayer( layer => {
      let properties = layer.feature.properties;
        //Busca por local
        if ( properties.nome.search(regex) != -1 && searchField){
          placesAndProducts.push(layer.feature.properties.nome);
        }
        //Busca por produto 
        let produtos = properties.produtos;
        for (let i = produtos.length - 1; i >= 0; i--) {
          if(produtos[i].search(regex) != -1 && searchField){
            placesAndProducts.push(properties.nome);
          }
        }
    });
    //Busca por bairro
    bairrosLayer.eachLayer( layer => {
      layer.setStyle(bairroEstilo);
      if ( layer.feature.properties.nome.search(regex) != -1 &&  searchField){
        neighborhoods.push(layer.feature.properties.nome);
      }
    });

    //Configuração da listagem
    allFound = placesAndProducts.concat(neighborhoods);

    if (allFound.length === 0) {
      listSearch += `<li class="list-group-item">Nenhum resultado`;
    } else {
      allFound.sort();
      allFound = allFound.reduce(function (acumulador, nome) {
        if (acumulador.indexOf(nome) == -1) {
          acumulador.push(nome)
        }
        return acumulador;
      }, []);

      allFound = allFound.slice(0,7);

      allFound.forEach( function(element, index) {
        let layer = getLayerByAttribute(markersCluster,element);
        let layerBairro = getLayerByAttribute(bairrosLayer,element);
        listSearch += `<li class="list-group-item link-class"><span class="tituloNaLista">${element}</span> <br>`;
        if (!bairrosLayer.hasLayer(layerBairro)) {
          listSearch += `<span class="produtosNaLista">`;
          layer.feature.properties.produtos.forEach((elementI, indexI) => {
            if (indexI < 5) {
              listSearch += `${elementI}, `;
            }
          });
          listSearch += `...</span>`;
        }
      });
      highlightForSearch(placesAndProducts, markersCluster);
    }

    listSearch += `</li>`;

    document.getElementById('search-all-results').innerHTML = listSearch;
    placesAndProducts.length = 0;
    neighborhoods.length = 0;
    allFound.length = 0;
  }
});

const highlightForSearch = (array, layerGroup) => {
  let localLayerGroup = L.layerGroup();
  array.forEach(element => {
    localLayerGroup.addLayer(getLayerByAttribute(layerGroup, element));
  });

    layerGroup.eachLayer(layer => {
      if (localLayerGroup.hasLayer(layer)) {
        layer.setIcon(iconMarkers[`${layer.feature.properties.current_tipo}Selected`]);
      } else {
        layer.setIcon(iconMarkers[`${layer.feature.properties.current_tipo}`]);
      }
    })
}

$('#search-all-results').on('click', 'li', e => {
  let inputValue = $(e.target.childNodes[0]).text().trim();
  $('#search-all-input').val( inputValue );
  let layer = getLayerByAttribute(markersCluster,inputValue);
  if (markersCluster.hasLayer(layer)) {
    moveToPoint( markersCluster, inputValue );
  } else {
    moveToPolygon( bairrosLayer, inputValue );
  }
  document.getElementById('search-all-results').innerHTML = '';
});

const getLayerByAttribute = (layerGroup, attribute) => {
  let layerReturn;
  layerGroup.eachLayer(layer => {
    if (layer.feature.properties.nome === attribute) {
        layerReturn = layer;
    }
  });
  return layerReturn;
}

const moveToPolygon = (layerToSearch, name ) => {
  layerToSearch.eachLayer( layer => {
    if ( layer.feature.properties.nome === name ){
      layer.setStyle(bairroDestaqueEstilo);
      map.setView(layer._latlngs[0][0][0],14);
      //layer.bindPopup(name).openPopup();
    }
  })
}

const moveToPoint = ( layerToSearch, name ) => {
  let 
  controle = true,// Variável evita mais de uma chamada ao 'zoomend' por vez 
  latlng;
  layerToSearch.eachLayer( layer => {
    if ( layer.feature.properties.nome === name ){
      latlng = L.latLng( layer.feature.geometry.coordinates[1], layer.feature.geometry.coordinates[0] );
      map.flyTo( latlng,14 );
      map.on('zoomend', () => {
        if ( controle ) {
          layer.openPopup();
          controle = false;
        }
      });
    }
  });
};
