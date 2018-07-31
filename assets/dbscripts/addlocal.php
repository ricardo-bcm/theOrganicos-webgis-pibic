<?php
  include('dbconnexion.php');
  header('Content-Type: application/json');
  $content = trim(file_get_contents("php://input"));
  $data = json_decode($content, true);

    $nome = $data['nome'];
    $endereco = $data['endereco'];
    $horario = $data['horario'];
    $contato = $data['contato'];
    $longitude = $data['longitude'];
    $latitude = $data['latitude'];
    $descricao = $data['descricao']; 

    $query = "INSERT INTO public.feira(nome_feira, endereco_feira, horario_funcionamento, contato_feira, geom, descricao_feira)
    VALUES('$nome', '$endereco', '$horario', '$contato', ST_GeomFromText('POINT($longitude $latitude)',4326), '$descricao')"; 

    $result = pg_query( $connexion, $query);

    $json = json_encode($result);
 ?>