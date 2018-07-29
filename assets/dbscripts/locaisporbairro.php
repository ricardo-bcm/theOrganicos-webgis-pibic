<?php 
include 'dbconnexion.php';
header('Content-Type: application/json');
$content = trim(file_get_contents("php://input"));
$data = json_decode($content, true);

$nomeBairro = $data['name'];
$feiras = array();
$comercios = array();
$unidadeProdutoras = array();

$sql = "SELECT f.nome_feira as nome
    FROM feira f
    JOIN bairro b
        ON ST_WITHIN(f.geom, b.geom)
        WHERE b.nome_bairro = '$nomeBairro'";

        $result = pg_query($connexion, $sql);
        while ($row = pg_fetch_assoc($result)) {
            $feiras[] = $row;
        }

$sql = "SELECT c.nome_fantasia as nome
    FROM comercio c
    JOIN bairro b
        ON ST_WITHIN(c.geom, b.geom)
        WHERE b.nome_bairro = '$nomeBairro'";

        $result = pg_query($connexion, $sql);
        while ($row = pg_fetch_assoc($result)) {
            $comercios[] = $row;
        }

$sql = "SELECT u.nome_unidade_produtora as nome
    FROM unidade_produtora u
    JOIN bairro b
        ON ST_WITHIN(u.geom, b.geom)
        WHERE b.nome_bairro = '$nomeBairro'";

        $result = pg_query($connexion, $sql);
        while ($row = pg_fetch_assoc($result)) {
            $unidadeProdutoras[] = $row;
        }

$arrayResult = array_merge($feiras, $comercios, $unidadeProdutoras);

$json = json_encode($arrayResult,JSON_UNESCAPED_UNICODE);

echo $json;

 ?>