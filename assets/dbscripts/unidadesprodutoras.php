<?PHP

include('dbconnexion.php');

$url = 'http://localhost:8080/geoserver/wfs?request=GetFeature&service=WFS&version=2.0.0&typeName=the_organicos_ws:unidade_produtora&outputFormat=application/json';
header('Content-Type: application/json');

$json = file_get_contents($url);
$json = json_decode($json);

foreach ($json->features as $key => $value) {
	$value->properties->current_tipo = "Produtor";
	$name = $value->properties->nome_unidade_produtora;
	unset($value->properties->nome_unidade_produtora);
	$value->properties->nome = $name;

	$unidadeProdutoraId = filter_var($value->id, FILTER_SANITIZE_NUMBER_INT);	
	$sql = "SELECT p.nome_produto, p.tipo_produto
				FROM produto p , unidade_produtora_produto upp
					WHERE upp.unidade_produtora_id_unidade_produtora = $unidadeProdutoraId
					AND upp.produto_id_produto = p.id_produto
						ORDER BY p.nome_produto ASC";
	$result = pg_query($connexion, $sql);
	$produtosAndUnidades = array();
	while ($row = pg_fetch_assoc($result)) {
		$produtosAndUnidades[] = $row;
	}

	$value->properties->produtos = $produtosAndUnidades;

	$sql = "SELECT iu.imagem_caminho
				FROM imagem_unidade_produtora iu
					WHERE iu.unidade_produtora_id = $unidadeProdutoraId";
	$result = pg_query($connexion, $sql);
	$images = array();
	while ($row = pg_fetch_array($result)) {
		$images[] = $row[0];
	}

	$value->properties->imagens = $images;
}

$json = json_encode($json,JSON_UNESCAPED_UNICODE);

echo $json;
