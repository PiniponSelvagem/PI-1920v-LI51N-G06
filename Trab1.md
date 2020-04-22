<div style="text-align: center">
Instituto Superior de Engenharia de Lisboa
 
<div style="font-size: 80%">Licenciatura em Engenharia Informática e de Computadores</div>
 
Programação na Internet
 
Semestre de Verão de 2019/2020 – **1ª Parte do Trabalho prático**
</div>
 
---
 
# Introdução
 
A avaliação da componente prática da disciplina de Programação na Internet será realizada com base na aplicação COTA (Chelas Open TV Application), a ser desenvolvida ao longo do semestre. A aplicação fornece acesso, através de uma interface web (hipermédia), a algumas das funcionalidades disponibilizadas pelo sítio [The Movie Database - TMDb](https://www.themoviedb.org), nomeadamente as que dizem respeito às séries de TV, fazendo para esse efeito uso da sua Web API:
[https://developers.themoviedb.org/3/getting-started](https://developers.themoviedb.org/3/getting-started). Para viabilizar o acesso a esta API, cada grupo tem de criar uma conta e solicitar a criação de um token (api_key) para identificação da aplicação que vai desenvolver. Esse token será incluído em todos os pedidos HTTP realizados. A criação de uma api_key é descrita [aqui](https://developers.themoviedb.org/3/getting-started/introduction).
 
O desenvolvimento será realizado de forma incremental, envolvendo necessariamente vários ciclos de refactoring do código produzido e, por isso, é fundamental que faça uso de técnicas Object-Oriented e de boas práticas de programação em geral, de modo a reduzir o esforço associado a cada ciclo.
 
O desenvolvimento da aplicação COTA é faseado em três enunciados (Parte 1, Parte 2 e Parte 3). Em cada enunciado é definida a data limite de entrega da solução, um detalhe não negociável. A entrega é realizada através da criação da tag **ParteX** no repositório GitHub do grupo, onde X corresponde ao número da parte a entregar.
 
Para cada funcionalidade da aplicação COTA deve ser definido o *endpoint* HTTP correspondente que o implementa. A descrição de todos endpoints da aplicação devem constar no wiki do repositório na forma de documentação da API (podem-se basear na documentação da The Movie Database). No repositório deve ainda constar um ficheiro com o resultado da exportação da coleção Postman com os pedidos que validam a API.
 
Para cada funcionalidade da aplicação disponibilizado pela API, deve ser definido  o *endpoint* HTTP correspondente que o implementa. Na documentação de cada *endpoint* deve no mínimo constar: o tipo de pedido HTTP, o respetivo Uri, o formato e conteúdo do pedido (caso exista) e o formato e conteúdo da resposta. Esta documentação deve constar no wiki do repositório na forma de documentação da API (podem-se basear na documentação da API The Movie Database). No repositório deve ainda constar um ficheiro com o resultado da exportação da coleção Postman com os pedidos que validam a API.
 
Resumo dos artefactos a submeter na entrega:
 
* Directoria node.js com a aplicação COTA
* Wiki com a documentação da API da aplicação COTA
* Projecto Postman de validação da API da aplicação COTA
 
**Data limite de entrega da 1ª parte: 27/04/2020-23h59**.
 
# Requisitos Funcionais
 
Desenvolver uma aplicação Web que disponibiliza uma Web API que segue os princípios REST, com respostas em formato Json e  que suporta as seguintes funcionalidades:
 
* Obter a lista das séries de TV mais populares
* Pesquisar séries pelo nome
* Gerir grupos de séries favoritos
  * Criar grupo atribuindo-lhe um nome e descrição
  * Editar grupo, alterando o seu nome e descrição
  * Listar todos os grupos
  * Obter os detalhes de um grupo, com o seu nome, descrição e nomes das séries que o constituem.
  * Adicionar um série a um grupo
  * Remover uma série de um grupo
  * Obter as séries de um grupo que têm uma votação média entre dois valores (mínimo e máximo) entre 0 e 10, sendo estes valores parametrizáveis no pedido. As séries vêm ordenadas por decrescente da sua votação média.
 
# Requisitos Não Funcionais
 
A aplicação devem ser desenvolvida com a tecnologia Node.js. Para o atendimento de pedidos HTTP deve ser usado o módulo [express](https://expressjs.com/). Para realização de pedidos, pode ser usado o módulo http ou em alternativa o módulo [request](https://www.npmjs.com/package/request).
 
A API TMDb é usada para obtenção de dados (consulta) sobre as séries.
 
Os dados que são próprios da aplicação, que podem ser criados alterados e apagados, nomeadamente toda a gestão de grupos, devem ser guardados em memória.
 
Qualquer um dos módulos base do Node.js pode ser usado. Além destes, nesta 1ª parte do trabalho, apenas podem ser usados os seguintes módulos:
 
* express - Atendimento de pedidos HTTP
* request – Realização de pedidos HTTP
* debug – Mensagens de debug
* mocha – Testes unitários
  
Qualquer outro módulo que pretenda usar, deve ser previamente debatido e autorizado pelo respetivo docente.
 
Todos os pedidos PUT e POST devem enviar os seus dados no corpo do pedido (_body_) e não na _query string_. [Aqui](https://nodejs.org/en/docs/guides/anatomy-of-an-http-transaction/#request-body) pode ver como lidar com os dados do corpo do pedido HTTP usando o módulo `http`.
 
A aplicação servidora deve ser constituída por <u>pelo menos</u> 5 módulos Node:
 
* <code>cota-server.js</code> - ficheiro que constitui o ponto de entrada na aplicação servidora
* <code>cota-web-api.js</code> -  implementação dos rotas HTTP que constituem a API REST da aplicação Web
* <code>cota-services.js</code> - implementação da lógica de cada uma das funcionalidades da aplicação
* <code>movie-database-data.js</code> - acesso à API TMDb.
* <code>cota-db.js</code> - acesso ao repositório em memória.
 
As dependência entre estes módulos é a seguinte:
 
<pre>
cota-server.js -> cota-web-api.js -> cota-services.js -> movie-database-data.js
                                                            -> cota-db.js
</pre>
 
A metodologia de desenvolvimento da aplicação servidora deve ser a seguinte e por esta ordem:
 
1. Desenhar e documentar as rotas da API (tipo de pedido HTTP + URL+exemplo de conteúdo da resposta) e documentar no wiki do repositório do grupo
2. Criar uma coleção no Postman (exº COTA) para testar as rotas da API
3. Implementar o módulo de entrada da aplicação servidora: <code>cota-server.js</code>. Para este módulo não é necessário criar testes unitários, uma vez que este não deve implementar qualquer lógica que não seja receber alguns argumentos da linha de comando (configuração), registar rotas e iniciar o servidor web. Este módulo pode ir sendo construído à medida que vão sendo implementadas cada uma das rotas em cota-web-api.js.
4. No módulo <code>cota-web-api.js</code> implementar as rotas da API, uma a uma.
   * Para cada rota implementada, utilizar os testes do Postman para verificar o correto funcionamento dessa rota.
   * Apenas passar à implementação da próxima rota quando a anterior estiver completamente implementada e testada.
   * Para cada rota criar um pedido na coleção do Postman que a valida.
   * Nesta fase da implementação do módulo <code>cota-web-api.js</code> **usar dados locais (*mock* do <code>cota-service.js</code>)**, ou seja, os testes deve ser realizados sem acesso à API do Board Game Atlas nem ao repositório.
  
5. Implementar os serviços da aplicação no módulo cota-services.js.
   * Seguir uma abordagem semelhante à utilizada em cota-web-api.js no desenvolvimento das funcionalidades deste módulo e respetivos testes unitários.
   * À semelhança do módulo cota-services.js os testes unitários devem ser executados sem acesso à API do TMDB nem ao repositório de dados em memória (**mocks de movie-database-data.js e cota-db.js**).
6. Implementar os módulos de acesso a dados:
   * <code>movie-database-data.js</code> - acesso à API TMDb.
   * <code>cota-db.js</code> - acesso ao repositório em memória.

