<?PHP
$url = 'http://localhost:8080/geoserver/wfs?request=GetFeature&service=WFS&version=2.0.0&typeName=the_organicos_ws:bairro&outputFormat=application/json';
header('Content-Type: application/json');

$json = file_get_contents($url);

echo $json;
