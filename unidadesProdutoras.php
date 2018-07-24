<?PHP

$host = 'localhost';
$port = '5432';
$database = 'the_organicos';
$user = 'postgres';
$password = 'erre';

$connexion = pg_connect("host=$host port=$port dbname=$database user=$user password=$password");

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
	$sql = "SELECT p.nome_produto
				FROM produto p , unidade_produtora_produto upp
					WHERE upp.unidade_produtora_id_unidade_produtora = $unidadeProdutoraId
					AND upp.produto_id_produto = p.id_produto
						ORDER BY p.nome_produto ASC";
	$result = pg_query($connexion, $sql);
	$produtosAndUnidades = array();
	while ($row = pg_fetch_array($result)) {
		$produtosAndUnidades[] = $row[0];
	}

	$value->properties->produtos = $produtosAndUnidades;
}

$json = json_encode($json,JSON_UNESCAPED_UNICODE);

echo $json;
