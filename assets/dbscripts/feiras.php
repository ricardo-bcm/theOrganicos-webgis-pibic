<?PHP

include('dbconnexion.php');

$url = 'http://localhost:8080/geoserver/wfs?request=GetFeature&service=WFS&version=2.0.0&typeName=the_organicos_ws:feira&outputFormat=application/json';
header('Content-Type: application/json');

$json = file_get_contents($url);
$json = json_decode($json);

foreach ($json->features as $key => $value) {
	$value->properties->current_tipo = "Feira";
	$name = $value->properties->nome_feira;
	unset($value->properties->nome_feira);
	$value->properties->nome = $name;

	$feiraId = filter_var($value->id, FILTER_SANITIZE_NUMBER_INT);	
	$sql = "SELECT p.nome_produto, p.tipo_produto
				FROM produto p , feira_produto fp
					WHERE fp.feira_id_feira = $feiraId
					AND fp.produto_id_produto = p.id_produto
						ORDER BY p.nome_produto ASC";
	$result = pg_query($connexion, $sql);
	$produtos = array();
	while ($row = pg_fetch_assoc($result)) {
		$produtos[] = $row;
	}

	$value->properties->produtos = $produtos;

	$sql = "SELECT if.imagem_caminho
				FROM imagem_feira if
					WHERE if.feira_id = $feiraId";
	$result = pg_query($connexion, $sql);
	$images = array();
	while ($row = pg_fetch_array($result)) {
		$images[] = $row[0];
	}

	$value->properties->imagens = $images;

}

$json = json_encode($json,JSON_UNESCAPED_UNICODE);

echo $json;
