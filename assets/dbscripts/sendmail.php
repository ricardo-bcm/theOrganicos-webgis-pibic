<?php
  header('Content-Type: application/json');
  $content = trim(file_get_contents("php://input"));
  $data = json_decode($content, true);

  if ( !isset( $data ) || empty($data) || $data === NULL ) {
    $response['status'] = array(
        'type' => 'message',
        'value' => '400',
      );
    $encoded = json_encode($response);
    exit($encoded);
  } else {
    $name = $data['nome'];
    $emailcontato = $data['email'];
    $telefone = $data['telefone'];
    $mensagem = $data['mensagem'];

    $email = 'contato.theorganicos@gmail.com';
    $assunto = substr($mensagem, 0, 20);
    $corpo = 'Email para contato: ' . $emailcontato;
    $corpo .= 'Telefone para contato: ' . $telefone;
    $corpo .= $mensagem;

    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
    $headers .= 'Cc: contato.theorganicos@gmail.com' . "\r\n";

    mail($email, $assunto, $corpo, $headers);
    
  } //Fim else
 ?>