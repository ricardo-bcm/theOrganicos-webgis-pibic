const removeAccents = myString => myString.normalize('NFD').replace(/[\u0300-\u036f]/g, "");

const reduceArray = arrayToReduce => {
  arrayToReduce = arrayToReduce.reduce(function (acumulador, nome) {
    if (acumulador.indexOf(nome) == -1) {
      acumulador.push(nome)
    }
    return acumulador;
  }, []);

  return arrayToReduce;
}

//Script de contato
document.getElementById('button-contato').onclick = () => {
  $('#contatoModal').find('.modal-header').html('<h4>Enviando mensagem...<h4>');
  enviarMensagem().then( response => {
    document.getElementById('contact-form').reset();
    $('#contatoModal').find('.modal-header').html('<h4>Mensagem enviada!</h4>');
  } );
};

$('#contatoModal').on('hidden.bs.modal', function (e) {
  $('#contatoModal').find('.modal-header').html('<h4>Envie-nos uma mensagem</h4>');
});

const enviarMensagem = async () => {
  const url = 'assets/dbscripts/sendmail.php';

  let
  nomeInput = document.getElementById('nome-contato').value,
  emailInput = document.getElementById('email-contato').value,
  telefoneInput = document.getElementById('telefone-contato').value,
  mensagemInput = document.getElementById('mensagem-contato').value;

  let informacoes = {
    nome : nomeInput,
    email: emailInput,
    telefone : telefoneInput,
    mensagem: mensagemInput
  };

  let fetchData = {
    method: "POST",
    body: JSON.stringify(informacoes)
  };

  try {
      let response = await fetch( url, fetchData );
      if ( response.ok ) {
        let jsonResponse = await response.json();
        return jsonResponse;
      }
    } catch( e ) {
      console.log( 'Erro log: ' + e );
    }
}
