# MotoEmDia — MVP

App para motociclistas acompanharem manutenções da moto e pedirem orçamento. Mobile-first, com área do usuário e painel do administrador.

## O que será construído

**Página inicial pública**
Header (MotoEmDia, Como funciona, Benefícios, Entrar), hero com "Cuide da sua moto antes que ela cobre a conta", CTA "Cadastrar minha moto", seção Como funciona (3 passos) e cards de Benefícios. Ilustração feita com elementos da interface, sem gerar imagens.

**Conta**
Cadastro com nome, e-mail e senha, login, logout e recuperação de senha. Quem acabou de criar conta é levado direto para o cadastro da moto.

**Minha moto**
Fabricante, modelo, ano, cilindrada, placa, apelido e quilometragem. Edição posterior. Uma moto por usuário (banco já preparado para várias no futuro).

**Atualizar quilometragem**
Ação rápida; não aceita valor menor que o atual; cada atualização fica registrada com data.

**Painel "Minha Moto"**
Dados da moto no topo, cards de resumo (manutenções registradas, itens OK, itens em atenção, última manutenção) e a seção "Situação da sua moto" com Óleo, Freios, Pneus, Relação, Revisão, Filtro de ar e Vela.

**Como o status é calculado (intervalo definido pelo usuário)**
Cada categoria tem um intervalo em km que o próprio usuário define numa tela de Configurações (com valores iniciais sugeridos, ex.: óleo 3.000 km, que ele pode mudar). Comparando a quilometragem atual com a do último registro daquela categoria:
- até 70% do intervalo: OK (verde)
- de 70% a 100%: Atenção (amarelo)
- acima de 100%: Verificar (vermelho)
- sem registro da categoria: "Sem informações"
Nenhum diagnóstico mecânico automático.

**Registrar manutenção**
Tipo (troca de óleo, revisão, freios, pneus, relação, filtro de ar, vela, bateria, outro), data, quilometragem, valor, oficina e observações.

**Histórico**
Lista do mais recente ao mais antigo, detalhe do registro, edição e exclusão com confirmação. Estado vazio com "Você ainda não registrou nenhuma manutenção" e botão para registrar a primeira.

**Solicitar orçamento**
Formulário com serviço, descrição, nome, telefone/WhatsApp, moto, quilometragem e preferência de contato. Moto e quilometragem vêm preenchidas. Status inicial "Novo" e mensagem "Solicitação recebida. Entraremos em contato pelo WhatsApp."

**Minhas solicitações**
Serviço, data e status (Novo, Em contato, Orçamento enviado, Serviço realizado, Encerrado).

**Perfil**
Nome, e-mail e telefone (nome e telefone editáveis), atalho para editar a moto, configurações de intervalos e sair da conta.

**Navegação**
Barra inferior no celular: Início, Histórico, Registrar, Solicitações, Perfil. No desktop vira header/sidebar.

**Painel administrativo (/admin)**
Só para administradores. Cards com total de usuários, usuários com moto, motos, manutenções registradas, solicitações recebidas, novas e convertidas em serviço realizado. Lista de solicitações com filtro por status, detalhe completo, alteração de status e botão "Conversar pelo WhatsApp" abrindo wa.me com mensagem pronta. Lista de usuários com nome, e-mail, data de cadastro, moto, quantidade de manutenções e de solicitações. Senhas nunca são exibidas.

**Conta de demonstração**
Uma conta claramente identificada como demo, com a Honda NXR 160 Bros 2018 / 42.350 km e as manutenções de exemplo (óleo 40.000, revisão 36.000, freios 38.500). Dados de demo ficam apenas nessa conta, separados de usuários reais.

**Visual**
Azul escuro para estrutura, azul médio para ações, verde/amarelo/vermelho apenas para status, fundo branco/cinza claro, cards com cantos arredondados, sombras discretas, tipografia moderna. Mobile primeiro, sem rolagem horizontal, botões confortáveis ao toque. Estados de carregamento, erro, vazio e sucesso em todas as telas.

## Detalhes técnicos

- Lovable Cloud (banco + autenticação nativa); nada externo.
- Tabelas: `profiles`, `motorcycles`, `mileage_updates`, `maintenance_records`, `quote_requests`, mais `maintenance_intervals` (intervalo por categoria definido pelo usuário).
- Papel de admin em tabela separada `user_roles` com função `has_role`, nunca no perfil — evita escalonamento de privilégio.
- Regras de acesso no banco (RLS): cada usuário só lê/escreve as próprias linhas; admin lê o necessário via `has_role`. A proteção não depende de esconder botões.
- Rotas privadas sob layout autenticado; `/admin` com verificação de papel também no servidor.
- Validação de formulários com zod; telefone codificado ao montar o link wa.me.
- Sem Stripe, mapa, IA, notificações, e-mail transacional, várias motos ou assinatura.

## Fora do escopo (propositalmente)

Pagamentos, marketplace, geolocalização, APIs de oficinas/fabricantes, IA e diagnóstico automático, chatbot, WhatsApp Business API, push, e-mail transacional, múltiplas motos e planos pagos.

## Pendente de você

Me informe o e-mail que será o administrador (posso implementar tudo antes e marcar esse e-mail como admin quando você mandar).
