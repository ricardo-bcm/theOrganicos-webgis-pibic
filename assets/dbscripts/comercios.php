<?PHP

include('dbconnexion.php');

$url = 'http://localhost:8080/geoserver/wfs?request=GetFeature&service=WFS&version=2.0.0&typeName=the_organicos_ws:comercio&outputFormat=application/json';
header('Content-Type: application/json');

$json = file_get_contents($url);
$json = json_decode($json);

foreach ($json->features as $key => $value) {
	$value->properties->current_tipo = "Comercio";
	$name = $value->properties->nome_fantasia;
	unset($value->properties->nome_fantasia);
	$value->properties->nome = $name;

	$comercioId = filter_var($value->id, FILTER_SANITIZE_NUMBER_INT);	
	$sql = "SELECT p.nome_produto, p.tipo_produto
				FROM produto p , comercio_produto cp
					WHERE cp.comercio_id_comercio = $comercioId
					AND cp.produto_id_produto = p.id_produto
						ORDER BY p.nome_produto ASC";
	$result = pg_query($connexion, $sql);
	$produtosAndUnidades = array();
	while ($row = pg_fetch_assoc($result)) {
		$produtosAndUnidades[] = $row;
	}

	$value->properties->produtos = $produtosAndUnidades;

	$sql = "SELECT ic.imagem_caminho
				FROM imagem_comercio ic
					WHERE ic.comercio_id = $comercioId";
	$result = pg_query($connexion, $sql);
	$images = array();
	while ($row = pg_fetch_array($result)) {
		$images[] = $row[0];
	}

	$value->properties->imagens = $images;
}

$json = json_encode($json,JSON_UNESCAPED_UNICODE);

echo $json;
