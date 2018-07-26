<?PHP
$url = 'http://localhost:8080/geoserver/wfs?request=GetFeature&service=WFS&version=2.0.0&typeName=the_organicos_ws:bairro&outputFormat=application/json';
header('Content-Type: application/json');

$json = file_get_contents($url);
$json = json_decode($json);

foreach ($json->features as $key => $value) {
	$name = $value->properties->nome_bairro;
	unset($value->properties->nome_bairro);
	$value->properties->nome = $name;
}

$json = json_encode($json,JSON_UNESCAPED_UNICODE);

echo $json;
