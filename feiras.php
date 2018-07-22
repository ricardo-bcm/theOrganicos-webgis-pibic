<?PHP

$host = 'localhost';
$port = '5432';
$database = 'the_organicos';
$user = 'postgres';
$password = 'erre';

$connexion = pg_connect("host=$host port=$port dbname=$database user=$user password=$password");

$url = 'http://localhost:8080/geoserver/wfs?request=GetFeature&service=WFS&version=2.0.0&typeName=the_organicos_ws:feira&outputFormat=application/json';
header('Content-Type: application/json');

$json = file_get_contents($url);
$json = json_decode($json);

foreach ($json->features as $key => $value) {
	$json->features[$key]->properties->current_tipo = "Feira";

	$feiraId = filter_var($json->features[$key]->id, FILTER_SANITIZE_NUMBER_INT);	
	$sql = "SELECT p.nome_produto
				FROM produto p , feira_produto fp
					WHERE fp.feira_id_feira = $feiraId
					AND fp.produto_id_produto = p.id_produto
						ORDER BY p.nome_produto ASC";
	$result = pg_query($connexion, $sql);
	$produtosAndUnidades = array();
	while ($row = pg_fetch_array($result)) {
		$produtosAndUnidades[] = $row[0];
	}

	$json->features[$key]->properties->produtos[] = $produtosAndUnidades;
}

$json = json_encode($json,JSON_UNESCAPED_UNICODE);

echo $json;
