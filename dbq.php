<?PHP

$host = 'localhost';
$port = '5432';
$database = 'the_organicos';
$user = 'postgres';
$password = 'erre';

$connexion = pg_connect("host=$host port=$port dbname=$database user=$user password=$password");

$sql = 'SELECT up.nome_unidade_produtora, p.nome_produto
	FROM unidade_produtora up, produto p, unidade_produtora_produto upp
		WHERE upp.unidade_produtora_id_unidade_produtora = up.id_unidade_produtora
		AND upp.produto_id_produto = p.id_produto';


$result = pg_query($connexion, $sql);

$produtosAndUnidades = array();

while ($row = pg_fetch_array($result)) {
	$produtosAndUnidades[] = $row;
}

$json = json_encode($produtosAndUnidades,JSON_UNESCAPED_UNICODE);

echo $json;