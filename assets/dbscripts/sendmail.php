<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'Exception.php';
require 'PHPMailer.php';
require 'SMTP.php';

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

  $assunto = substr($mensagem, 0, 20);
  $corpo = "<h4>Email para contato: $emailcontato</h4>";
  $corpo .= "<h4>Telefone para contato: $telefone</h4>";
  $corpo .= "<p>$mensagem</p>";

  $mail = new PHPMailer(true);
  $mail->isSMTP();
  $mail->Host = "smtp.gmail.com";
  $mail->SMTPAuth = true;
  $mail->SMTPSecure = "tls";
  $mail->Username = "contato.theorganicos@gmail.com";
  $mail->Password = "####";
  $mail->Port = 587;
  $mail->SMTPDebug = 2;
  $mail->setFrom('contato.theorganicos@gmail.com', $name);
  $mail->addAddress('contato.theorganicos@gmail.com', 'The Orgânicos');

  $mail->isHTML(true);
  $mail->Subject = $assunto;
  $mail->Body = $corpo;

  if(!$mail->send()) {
      echo 'Erro: ' . $mail->ErrorInfo;
  } else {
        $response['message'] = array(
            'type' => 'message',
            'value' => '200',
        );
        $encoded = json_encode($response);
        echo $encoded;
  }
} //Fim else
 ?>