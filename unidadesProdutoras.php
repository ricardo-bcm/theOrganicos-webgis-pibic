<?PHP
$url = 'http://localhost:8080/geoserver/wfs?request=GetFeature&service=WFS&version=2.0.0&typeName=the_organicos_ws:unidade_produtora&outputFormat=application/json';
header('Content-Type: application/json');

$json = file_get_contents($url);
$json = json_decode($json);
$json->features[0]->properties->current_tipo = "Produtor";

foreach ($json->features as $key => $value) {
	$json->features[$key]->properties->current_tipo = "Produtor";	
}

$json = json_encode($json);

echo $json;
