/*
  Autor: Ricardo Barbosa
  Email: ricardobcm@outlook.com
*/
let //Layers para controlar a inserção/remoção dos layers no cluster
unidadesLayerToControl = L.featureGroup(),
feirasLayerToControl = L.featureGroup(),
comerciosLayerToControl = L.featureGroup(),
unidadesLayer = L.layerGroup(),
feirasLayer = L.layerGroup(),
comerciosLayer = L.layerGroup(),
bairrosLayer = L.layerGroup(),
searchLayer = L.featureGroup();

//Agrupador de marcadores
let
markersCluster = L.markerClusterGroup({
  disableClusteringAtZoom: 10,
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
    popupAnchor: [0, -65]
  }
});

const
comercioMarker = new MarkerIcon({ iconUrl: 'assets/images/comercio-marker.png' }),
feiraMarker = new MarkerIcon({ iconUrl: 'assets/images/feira-marker.png' }),
unidadeMarker = new MarkerIcon({ iconUrl: 'assets/images/produtor-marker.png' }),
comercioMarkerSelected =  new MarkerIcon({ iconUrl: 'assets/images/comercio-marker-selected.png' }),
feiraMarkerSelected = new MarkerIcon({ iconUrl: 'assets/images/feira-marker-selected.png' }),
unidadeMarkerSelected = new MarkerIcon({ iconUrl: 'assets/images/produtor-marker-selected.png' }),

iconMarkers = {
  'Comercio': comercioMarker,
  'Feira': feiraMarker,
  'Unidade': unidadeMarker,
  'ComercioSelected': comercioMarkerSelected,
  'FeiraSelected': feiraMarkerSelected,
  'UnidadeSelected': unidadeMarkerSelected
};

let
mapboxUrl = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}',
accessToken = 'pk.eyJ1IjoicmljYXJkb2JjbSIsImEiOiJjajlrMTJkejQxaTUyMzNwZ3cxcnM3MDU2In0.pr0XFTVGiylyl6Sth57t9g',
attrib = '<a href="http://openstreetmap.org">OpenStreetMap</a> | <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a> | <a href="http://mapbox.com">Mapbox</a>',
//Layers
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

//Adicão do mapa
let map = L.map('map', {
  center: [-5.1894, -42.8081],
  zoom: 10,
  minZoom: 10,
  maxZoom: 18,
  zoomControl: false,
  closePopupOnClick: true,
  attributionControl: true
});

map.on('contextmenu', e => e);

// Controles
L.Control.zoomHome().addTo( map );

let //Minimapa
streetsMinimapLayer = new L.TileLayer( mapboxUrl, {
  attribution: attrib,
  id: 'mapbox.streets',
  minZoom: 6,
  maxZoom: 15,
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

let teresinaLayer =  L.tileLayer.wms('http://localhost:8080/geoserver/the_organicos_ws/wms?',{
  layers: "the_organicos_ws:teresina",
  transparent: true,
  format:"image/png"
}).addTo(map);


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
    "weight": 4.0,
    "opacity": 0.9,
};

const bindBairrosPopUp = (feature, layer ) => {
  let properties = feature.properties;
  layer.bindPopup(properties.nome);
}

const loadLayers = callback => {
    $.getJSON('assets/dbscripts/feiras.php', data => {
    let geoJsonFeiraLayer = L.geoJson( data, {
      pointToLayer: ( feature, latlng ) => L.marker( latlng, {icon: iconMarkers[feature.properties.current_tipo], title: feature.properties.nome}),
      onEachFeature: bindPopup
    });
    feirasLayerToControl.addTo( map );
  });
  $.getJSON('assets/dbscripts/unidadesprodutoras.php', data => {
    let geoJsonFeiraLayer = L.geoJson( data, {
      pointToLayer: ( feature, latlng ) => L.marker( latlng, {icon: iconMarkers[feature.properties.current_tipo], title: feature.properties.nome}),
      onEachFeature: bindPopup
    });
    unidadesLayerToControl.addTo( map );
  });
  $.getJSON('assets/dbscripts/comercios.php', data => {
    let geoJsonFeiraLayer = L.geoJson( data, {
      pointToLayer: ( feature, latlng ) => L.marker( latlng, {icon: iconMarkers[feature.properties.current_tipo], title: feature.properties.nome}),
      onEachFeature: bindPopup
    });
    comerciosLayerToControl.addTo( map );
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
  markersCluster.addTo( map );
}

const bindPopup = ( feature, layer ) => {
  let
  properties = feature.properties,
  popUpContent = '';

  if (properties.current_tipo === 'Unidade') {
      popUpContent += `
      <div class="container-popup">
        <div class="content-popup">
          <h4 class="header-popup"> ${properties.nome} </h4>
          <span class="info-content-text"><span class="info-content">Horário de Atendimento:</span> ${properties.horario_funcionamento_unidade_produtora}</span><br>
          <span class="info-content">Contato:</span> ${properties.contato_unidade_produtora}<br>
          <span class="info-content">Descricao:</span> ${properties.descricao_unidade_produtora}<br>`;
            let tipos = [];
            for (let produto of properties.produtos) {
              tipos.push(produto.tipo_produto);
            }

            tipos = reduceArray(tipos);

            popUpContent += `<span class="info-content">Produtos disponíveis: </span><span> `;

            for (let tipo of tipos) {
              popUpContent +=` ${tipo},`;
            }

            popUpContent = popUpContent.slice(0,-1);
            popUpContent += `</span>`;

          popUpContent += `</div>`;
  } else if (properties.current_tipo === 'Feira') {
      popUpContent += `
      <div class="container-popup">
        <div class="content-popup">
          <h4 class="header-popup"> ${properties.nome} </h4>
          <span class="info-content">Endereço:</span> ${properties.endereco_feira}<br>
          <span class="info-content">Horário:</span> ${properties.horario_funcionamento}<br>
          <span class="info-content">Contato:</span> ${properties.contato_feira}<br>
          <span class="info-content">Descricao:</span> ${properties.descricao_feira}<br>`;
          let tipos = [];
          for (let produto of properties.produtos) {
            tipos.push(produto.tipo_produto);
          }

          tipos = reduceArray(tipos);

          popUpContent += `<span class="info-content">Produtos disponíveis: </span><span> `;

          for (let tipo of tipos) {
            popUpContent +=` ${tipo},`;
          }

          popUpContent = popUpContent.slice(0,-1);
          popUpContent += `</span>`;

        popUpContent += `</div>`;
  } else if (properties.current_tipo === 'Comercio') {
      popUpContent += `
      <div class="container-popup">
        <div class="content-popup">
          <h4 class="header-popup"> ${properties.nome} </h4>
          <span class="info-content-text"><span class="info-content">Contato:</span> ${properties.contato_comercio}</span><br>
          <span class="info-content-text"><span class="info-content">CNPJ:</span> ${properties.cnpj_comercio}</span><br>
          <span class="info-content">Descrição:</span> ${properties.descricao_comercio}<br>`;
            let tipos = [];
            for (let produto of properties.produtos) {
              tipos.push(produto.tipo_produto);
            }

            tipos = reduceArray(tipos);

            popUpContent += `<span class="info-content">Produtos disponíveis: </span><span> `;

            for (let tipo of tipos) {
              popUpContent +=` ${tipo},`;
            }
            popUpContent = popUpContent.slice(0,-1);
            popUpContent += `</span>`;

          popUpContent += `</div>`;
  }

  popUpContent += `</div>
                   <div class="botao-mais">
                        <a href"#">
                            <button data-toggle="modal" data-target="#locais-modal">Mais</button>
                        </a>
                   </div>
            </div>`;

  layer.bindPopup( popUpContent , {
    maxWidth: "auto"
  });

  layer.on({
    mouseover : () => layer.setIcon(iconMarkers[`${properties.current_tipo}Selected`]),
    mouseout : () => layer.setIcon(iconMarkers[properties.current_tipo]),
  });

  layer.on('click', () => {
    buildModalFromLayer(layer);
  });

  addLayerByType[properties.current_tipo]( layer );
  searchLayer.addLayer(layer);
};

loadLayers(putThemOnMap);

const buildModalFromLayer = layer => {
  let 
  properties = layer.feature.properties,
  header = `<h4>${properties.nome}</h4>`,
  body = ``;

  if (properties.imagens.length > 0) {
    body += `<div id="carouselLocal" class="carousel slide" data-ride="carousel">
              <div class="carousel-inner">
                <div class="carousel-item active">
                  <img class="d-block w-100" src="${properties.imagens[0]}" alt="${properties.nome}">
                </div>`;
    let imagensTemp = properties.imagens.slice(1);
    for (let imagem of imagensTemp) {
          body += `<div class="carousel-item">
                    <img class="d-block w-100" src="${imagem}" alt="${properties.nome}">
                  </div>`;
    }
    body += `</div>
              <a class="carousel-control-prev" href="#carouselLocal" role="button" data-slide="prev">
                  <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                  <span class="sr-only">Anterior</span>
                </a>
                <a class="carousel-control-next" href="#carouselLocal" role="button" data-slide="next">
                  <span class="carousel-control-next-icon" aria-hidden="true"></span>
                  <span class="sr-only">Próximo</span>
                </a>
            </div>`;
  }

  body += '<div class="place-modal-content">';

  if (properties.current_tipo === 'Unidade') {
    body += `<span class="info-content">Horário de Atendimento:</span> ${properties.horario_funcionamento_unidade_produtora}<br>
             <span class="info-content">Contato:</span> ${properties.contato_unidade_produtora}<br><br>
             <span class="info-content">Descrição:</span> ${properties.descricao_unidade_produtora}`;
  } else if (properties.current_tipo === 'Feira') {
    body += `<span class="info-content">Endereço:</span> ${properties.endereco_feira}<br>
             <span class="info-content">Horário de Atendimento:</span> ${properties.horario_funcionamento}<br>
             <span class="info-content">Contato:</span> ${properties.contato_feira}<br><br>
             <span class="info-content">Descrição:</span> ${properties.descricao_feira}`;
  } else if (properties.current_tipo === 'Comercio') {
    body += `<span class="info-content">Endereço:</span> ${properties.endereco_comercio}<br>
             <span class="info-content">Horário de Atendimento:</span> ${properties.horario_funcionamento_comercio}<br>
             <span class="info-content">Contato:</span> ${properties.contato_comercio}<br><br>
             <span class="info-content">Descrição:</span> ${properties.descricao_comercio}`;
  }

  body += '</div>';

  body += `<h4>Produtos</h4>
          <table class="table table-hover">
            <caption>Lista de produtos</caption>
            <thead class="table-dark">
              <tr>
                <th scope="col" style="width: 70%">Nome</th>
                <th scope="col">Tipo</th>
              </tr>
            </thead>
            <tbody>`;
  for (let produto of properties.produtos) {
    body += `<tr>
                <td scope="row">${produto.nome_produto}</td>
                <td scope="row">${produto.tipo_produto}</td>
             </tr>`;
  }
  body += `</tbody>
          </table>`;

  $('#locais-modal').find('.modal-body').html(body);
  $('#locais-modal').find('.modal-header').html(header);
}

const addLayerByType = {
  'Comercio': layer => {
    comerciosLayer.addLayer( layer );
  },
  'Feira': layer => {
    feirasLayer.addLayer( layer );
  },
  'Unidade': layer => {
    unidadesLayer.addLayer( layer );
  }
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
  comerciosLayerToControl: isToAdd => {
    isToAdd ? markersCluster.addLayer( comerciosLayer ) : markersCluster.removeLayer( comerciosLayer );
  },
  feirasLayerToControl: isToAdd => {
    isToAdd ? markersCluster.addLayer( feirasLayer ) : markersCluster.removeLayer( feirasLayer );
  },
  unidadesLayerToControl: isToAdd => {
    isToAdd ? markersCluster.addLayer( unidadesLayer ) : markersCluster.removeLayer( unidadesLayer );
  }
};

const stringLayerName = layer =>
  layer === comerciosLayerToControl ? 'comerciosLayerToControl' :
  layer === feirasLayerToControl ? 'feirasLayerToControl' : 
  layer === unidadesLayerToControl ? 'unidadesLayerToControl' : '';

$('#switch-produtor').on('change', e => $(e.currentTarget).is(':checked') 
  ? map.addLayer( unidadesLayerToControl ) : map.removeLayer( unidadesLayerToControl ));
$('#switch-comercio').on('change', e => $(e.currentTarget).is(':checked') 
  ? map.addLayer( comerciosLayerToControl ) : map.removeLayer( comerciosLayerToControl ));
$('#switch-feira').on('change', e => $(e.currentTarget).is(':checked') 
  ? map.addLayer( feirasLayerToControl ) : map.removeLayer( feirasLayerToControl ));
$('#switch-horticolas').on('change', e => { layersForType() });
$('#switch-frutiferas').on('change', e => { layersForType() });
$('#switch-animal').on('change', e => { layersForType() });

const layersForType = () => {
  let 
  tipoEstado = {
    'HORTICOLAS' : $('#switch-horticolas').is(':checked'),
    'FRUTIFERAS' : $('#switch-frutiferas').is(':checked'),
    'PRODUCAO ANIMAL': $('#switch-animal').is(':checked')
  }

    searchLayer.eachLayer( layer => {
      let tipos = layer.feature.properties.tipos_produtos,
      cont = 0;
      for (let tipoL of tipos) {
        cont += tipoEstado[tipoL];
      }
      if (cont < 1) {
        markersCluster.removeLayer(layer);
      } else if (cont > 0 && !markersCluster.hasLayer(layer)) {
        markersCluster.addLayer(layer);
      }
    })
}

// Busca geral
$('#search-all-input').keyup( () => {
  let
  searchField = removeAccents( $('#search-all-input').val() ),
  regex = new RegExp( searchField, "i" ),
  listSearch = '',
  placesAndProducts = [],
  neighborhoods = [],
  allFound = [];

  highlightForSearch(placesAndProducts, markersCluster);
  bairrosLayer.eachLayer( layer => {
    layer.setStyle(bairroEstilo);
  });
  document.getElementById('select-bairro-type').innerHTML = 'Bairro';
  document.getElementById('list-all-markers').innerHTML = '';
  if ( !searchField ) {
    document.getElementById('search-all-results').innerHTML = '';
  } else {
    markersCluster.eachLayer( layer => {
      let properties = layer.feature.properties;
      //Busca por local
      if ( removeAccents( properties.nome ).search(regex) != -1 && searchField){
        placesAndProducts.push(layer.feature.properties.nome);
      }
      //Busca por produto 
      for (let produto of properties.produtos) {
        if(removeAccents( produto.nome_produto ).search(regex) != -1 && searchField){
          placesAndProducts.push(properties.nome);
        }
      }
    });
    //Busca por bairro
    bairrosLayer.eachLayer( layer => {
      layer.setStyle(bairroEstilo);
      if ( removeAccents( layer.feature.properties.nome ).search(regex) != -1 &&  searchField){
        neighborhoods.push(layer.feature.properties.nome);
      }
    });
    //Configuração da listagem
    allFound = placesAndProducts.concat(neighborhoods);

    if (allFound.length === 0) {
      listSearch += `<li class="list-group-item disabled">Nenhum resultado`;
    }
    else {
      allFound.sort();
      allFound = reduceArray(allFound);
      allFound = allFound.slice(0,7);

      for (let localName of allFound) {
        let layer = getLayerByAttribute(markersCluster, localName);
        let layerBairro = getLayerByAttribute(bairrosLayer, localName);
        listSearch += `<li class="list-group-item link-class"><span class="tituloNaLista">${localName}</span> <br>`;
        if (!bairrosLayer.hasLayer(layerBairro)) {
          listSearch += `<span class="produtosNaLista">`;
          layer.feature.properties.produtos.forEach((produto, index) => {
            if (index < 5) {
              listSearch += `${produto.nome_produto}, `;
            }
          });
          listSearch += `...</span>`;
        }
      }
      highlightForSearch(placesAndProducts, markersCluster);
    }
    listSearch += `</li>`;
    document.getElementById('search-all-results').innerHTML = listSearch;
    placesAndProducts.length = 0;
    neighborhoods.length = 0;
    allFound.length = 0;
  }
});

const highlightForSearch = (nomes, layerGroup) => {
  let localLayerGroup = L.layerGroup();
  for (let nome of nomes) {
    localLayerGroup.addLayer(getLayerByAttribute(layerGroup, nome));
  }
  layerGroup.eachLayer(layer => {
    if (localLayerGroup.hasLayer(layer)) {
      layer.setIcon(iconMarkers[`${layer.feature.properties.current_tipo}Selected`]);
    } else {
      layer.setIcon(iconMarkers[`${layer.feature.properties.current_tipo}`]);
    }
  });
}

$('#search-all-results').on('click', 'li', e => {
  let inputValue = $(e.target.childNodes[0]).text().trim();
  if (inputValue === 'Nenhum resultado') {
    $('#search-all-input').val('');
  } else {
    $('#search-all-input').val( inputValue );
    let layer = getLayerByAttribute(markersCluster,inputValue);
    if (markersCluster.hasLayer(layer)) {
      moveToPoint( markersCluster, inputValue );
    } else {
      moveToPolygon( bairrosLayer, inputValue );
      getPointsInsideNeighborhood(inputValue).then( response => listLocaisInNeighborhoods( response ) );
    }
  }
  document.getElementById('search-all-results').innerHTML = '';
});

const getPointsInsideNeighborhood = async nome => {
  const url = 'assets/dbscripts/locaisporbairro.php';

  let nomeWithoutAccents = nome.normalize('NFD').replace(/[\u0300-\u036f]/g, "");

  document.getElementById('select-bairro-type').innerHTML = nomeWithoutAccents;

  let information = {
    name : nome
  }

  let fetchData = {
    method: "POST",
    body: JSON.stringify(information)
  };

  try {
    let response = await fetch(url, fetchData);
    if (response.ok) {
      let jsonResponse = await response.json();
      return jsonResponse;
    }
  } catch(e) {
    console.log(e);
  }
}

const listLocaisInNeighborhoods = listOfLocais => {
  let 
  list = '',
  name = [];
  for (let item of listOfLocais) {
    list += `<li class="list-group-item link-class">${item.nome}<br></li>`;
    name.push(item.nome);
  }
  document.getElementById('list-all-markers').innerHTML = list;
  sycronizeListMarkers(name);
}

const getLayerByAttribute = (layerGroup, attribute) => {
  let layerReturn;
  layerGroup.eachLayer(layer => {
    if (layer.feature.properties.nome === attribute) {
        layerReturn = layer;
    }
  });
  return layerReturn;
}

const sycronizeListMarkers = markerNames => {
  let
  linePoint = '';
  document.getElementById('list-all-markers').innerHTML = '';

  for ( let markerName of markerNames ) {
    linePoint += `<li class="list-group-item list-group-item-action">${markerName}</li>`;
  }
  $('#list-all-markers').append( linePoint );
  updateEventsOnMarkers( '#list-markers li' );
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

const moveToPolygon = (layerToSearch, name ) => {
  let groupLayer = L.featureGroup();
  layerToSearch.eachLayer( layer => {
    if ( layer.feature.properties.nome === name ){
      layer.setStyle(bairroDestaqueEstilo);
      groupLayer.addLayer(layer);
    }
  });

  if (groupLayer.getLayers().length !== 0) {
    map.fitBounds(groupLayer.getBounds());
  }
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
          buildModalFromLayer(layer);
          layer.openPopup();
          controle = false;
        }
      });
    }
  });
};
