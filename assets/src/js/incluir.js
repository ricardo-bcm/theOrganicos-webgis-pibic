document.getElementById('btn-feira').onclick = () => {
  adicionarLocal().then( response => console.log('Salvo com sucesso!') );
  document.getElementById('feira-form').addEventListener('submit', event => {
    document.getElementById('feira-form').reset();
    event.preventDefault();
  });
};


const adicionarLocal = async () => {
  const url = 'assets/dbscripts/addlocal.php';

  let
  nomeInput = document.getElementById('nome').value,
  enderecoInput = document.getElementById('endereco').value,
  horarioInput = document.getElementById('horario').value,
  contatoInput = document.getElementById('contato').value,
  longitudeInput = document.getElementById('longitude').value,
  latitudeInput = document.getElementById('latitude').value,
  descricaoInput = document.getElementById('descricao').value;


  let informacoes = {
    nome : nomeInput,
    endereco : enderecoInput,
    horario: horarioInput,
    contato: contatoInput,
    longitude: longitudeInput,
    latitude: latitudeInput,
    descricao: descricaoInput
  };

  console.log(JSON.stringify(informacoes));

  let fetchData = {
    method: "POST",
    body: JSON.stringify(informacoes)
  };

  try {
      let response = await fetch( url, fetchData );
      console.log('Resposta: ' + response);
      if ( response.ok ) {
        let jsonResponse = await response.json();
        return jsonResponse;
      }
    } catch( e ) {
      console.log( 'Erro log: ' + e );
    }
}