import type { IconName } from './icons';

export interface Faq {
  q: string;
  a: string;
}

export interface Servico {
  slug: string;
  nome: string;
  // Palavra-chave principal da página (usada no H1 e no title)
  keyword: string;
  resumo: string;
  metaDescription: string;
  icon: IconName;
  intro: string[];
  sinais: string[];
  comoFazemos: string[];
  faq: Faq[];
  destaque?: boolean;
}

export const servicos: Servico[] = [
  {
    slug: 'desentupimento',
    nome: 'Desentupimento',
    keyword: 'Desentupimento 24 horas em São Paulo',
    resumo: 'Pias, ralos, vasos sanitários, tanques e colunas de esgoto desentupidos sem quebra-quebra.',
    metaDescription:
      'Desentupimento 24h em São Paulo: pia, ralo, vaso sanitário, tanque e esgoto. Chegamos em até 20 minutos, com garantia. Chame no WhatsApp.',
    icon: 'drain',
    destaque: true,
    intro: [
      'Entupimento não escolhe hora. Água voltando pelo ralo, vaso que não desce, pia da cozinha parada com gordura: a Dutra Hidráulica atende 24 horas, inclusive fins de semana e feriados, em toda a cidade de São Paulo.',
      'Usamos equipamentos próprios para cada tipo de obstrução, como máquinas de cabo rotativo e desentupidores de pressão, para resolver o problema sem quebrar piso nem parede sempre que possível.',
    ],
    sinais: [
      'Água descendo devagar na pia, no tanque ou no box',
      'Vaso sanitário transbordando ou com nível de água alto',
      'Mau cheiro de esgoto vindo dos ralos',
      'Barulho de borbulhas (gorgolejo) quando a água escoa',
      'Retorno de água em ralos de outros cômodos',
    ],
    comoFazemos: [
      'Identificamos o ponto exato da obstrução',
      'Escolhemos o equipamento adequado para o tipo de tubulação',
      'Desobstruímos e testamos o escoamento com água corrente',
      'Orientamos sobre como evitar novos entupimentos',
    ],
    faq: [
      {
        q: 'Vocês desentopem sem quebrar o piso?',
        a: 'Na grande maioria dos casos, sim. Trabalhamos com máquinas que alcançam a obstrução por dentro da tubulação. Só indicamos abertura quando há cano quebrado ou colapsado, e sempre com seu aceite antes.',
      },
      {
        q: 'Atendem desentupimento de madrugada?',
        a: 'Sim. O atendimento é 24 horas, todos os dias da semana, e chegamos em até 20 minutos.',
      },
      {
        q: 'Desentupimento tem garantia?',
        a: 'Sim, todo serviço da Dutra Hidráulica sai com garantia.',
      },
    ],
  },
  {
    slug: 'conserto-de-tubulacao-pvc',
    nome: 'Conserto de Tubulação PVC',
    keyword: 'Conserto de tubulação e cano PVC',
    resumo: 'Reparo de canos e conexões de PVC com vazamento, trincas ou emendas soltas.',
    metaDescription:
      'Conserto de tubulação e cano PVC em São Paulo. Vazamento, trinca ou conexão solta? Encanador 24h, chegamos em até 20 minutos. Com garantia.',
    icon: 'pipe',
    destaque: true,
    intro: [
      'O PVC é o material mais usado nas instalações hidráulicas residenciais e, com o tempo, conexões ressecam, emendas soltam e canos trincam por pressão ou impacto. O resultado é vazamento, mancha na parede e conta de água alta.',
      'Fazemos o conserto de tubulação PVC de água fria e de esgoto, trocando apenas o trecho danificado, com conexões e cola de qualidade, e testamos a linha sob pressão antes de fechar.',
    ],
    sinais: [
      'Manchas de umidade ou bolor na parede ou no teto',
      'Conta de água mais alta sem motivo aparente',
      'Barulho de água correndo com tudo fechado',
      'Gotejamento em conexões aparentes embaixo da pia ou do tanque',
    ],
    comoFazemos: [
      'Localizamos o vazamento com o mínimo de abertura possível',
      'Cortamos e substituímos o trecho danificado',
      'Usamos conexões e adesivo próprios para PVC',
      'Testamos a pressão e só então fechamos o local',
    ],
    faq: [
      {
        q: 'Precisa quebrar a parede para consertar o cano PVC?',
        a: 'Quando o cano está embutido, é preciso uma abertura pequena no ponto exato do vazamento. Localizamos antes para quebrar o mínimo possível.',
      },
      {
        q: 'Dá para consertar só o pedaço furado?',
        a: 'Sim. Na maioria das vezes trocamos apenas o trecho danificado, sem refazer toda a tubulação.',
      },
    ],
  },
  {
    slug: 'furo-em-cano-pvc',
    nome: 'Furo em Cano PVC',
    keyword: 'Conserto de furo em cano PVC',
    resumo: 'Furou o cano com prego ou broca? Fechamos o vazamento rápido e com segurança.',
    metaDescription:
      'Furou o cano PVC na parede com broca ou prego? Conserto de furo em cano PVC 24h em São Paulo. Chegamos em até 20 minutos.',
    icon: 'drop',
    intro: [
      'Furar um cano ao pendurar um quadro, instalar uma prateleira ou fixar um móvel é um dos chamados mais comuns. A água começa a sair pela parede e é preciso agir rápido para evitar estragos.',
      'Primeiro feche o registro geral. Depois chame a Dutra Hidráulica: chegamos em até 20 minutos, abrimos o mínimo necessário e trocamos o trecho perfurado com conexões adequadas.',
    ],
    sinais: [
      'Água saindo pelo furo da broca ou do prego',
      'Parede molhada logo após uma furação',
      'Queda de pressão repentina em torneiras e chuveiro',
    ],
    comoFazemos: [
      'Orientamos você por WhatsApp a fechar o registro enquanto vamos até aí',
      'Abrimos a parede apenas em volta do furo',
      'Substituímos o trecho com luvas de correr ou conexões novas',
      'Testamos e deixamos o local pronto para o acabamento',
    ],
    faq: [
      {
        q: 'Furei o cano, o que faço agora?',
        a: 'Feche o registro geral de água da casa ou do apartamento, desligue a energia se a água estiver perto de tomadas e chame um encanador. Não tente tampar com massa ou fita: o reparo provisório costuma voltar a vazar.',
      },
      {
        q: 'Fita veda-rosca ou durepoxi resolve?',
        a: 'Não de forma definitiva. Em cano com pressão, esses remendos cedem com o tempo. O correto é trocar o trecho furado.',
      },
    ],
  },
  {
    slug: 'furo-em-cano-de-cobre',
    nome: 'Furo em Cano de Cobre',
    keyword: 'Conserto de furo em cano de cobre',
    resumo: 'Reparo de tubulação de cobre de água quente e fria, com solda e conexões apropriadas.',
    metaDescription:
      'Conserto de furo e vazamento em cano de cobre em São Paulo. Solda e troca de trecho em água quente e fria. Atendimento 24h, com garantia.',
    icon: 'pipe',
    intro: [
      'Tubulações de cobre são comuns em água quente de prédios e casas mais antigas. Furos por broca, corrosão ou desgaste de solda causam vazamentos que precisam de técnica específica de reparo.',
      'Nossos encanadores trabalham com solda e conexões próprias para cobre, refazendo o trecho com segurança e sem improvisos.',
    ],
    sinais: [
      'Mancha esverdeada em conexões aparentes',
      'Vazamento em linha de água quente',
      'Parede úmida próxima a aquecedor ou boiler',
    ],
    comoFazemos: [
      'Isolamos e esvaziamos o trecho afetado',
      'Removemos a parte danificada',
      'Soldamos ou instalamos conexões novas adequadas ao cobre',
      'Testamos com água quente e fria em funcionamento',
    ],
    faq: [
      {
        q: 'Cano de cobre pode ser trocado por outro material?',
        a: 'Pode, em alguns casos, usando conexões de transição para PPR ou CPVC. Avaliamos no local qual é a melhor solução para a sua instalação.',
      },
    ],
  },
  {
    slug: 'conserto-de-cano-ppr',
    nome: 'Conserto de Cano PPR',
    keyword: 'Conserto de cano PPR',
    resumo: 'Reparo de tubulação PPR com termofusão, o método correto para esse material.',
    metaDescription:
      'Conserto de cano PPR com termofusão em São Paulo. Vazamento em água quente ou fria? Encanador 24h, chegamos em até 20 minutos.',
    icon: 'pipe',
    intro: [
      'O PPR é muito usado em construções novas, principalmente em água quente. Diferente do PVC, ele não é colado: as emendas são feitas por termofusão, com equipamento próprio.',
      'Por isso, o conserto de cano PPR exige ferramenta e experiência. Levamos a termofusora e as conexões certas para resolver o vazamento de forma definitiva.',
    ],
    sinais: [
      'Vazamento em apartamentos novos ou reformados recentemente',
      'Umidade perto de pontos de água quente',
      'Cano verde ou cinza aparente com gotejamento',
    ],
    comoFazemos: [
      'Localizamos o ponto do vazamento',
      'Cortamos o trecho danificado',
      'Fazemos a emenda por termofusão com conexões PPR',
      'Testamos a estanqueidade antes de fechar',
    ],
    faq: [
      {
        q: 'Dá para colar cano PPR?',
        a: 'Não. PPR não aceita cola. A emenda correta é por termofusão, que funde o material e cria uma junta única.',
      },
    ],
  },
  {
    slug: 'conserto-de-tubulacao-cpvc',
    nome: 'Conserto de Tubulação CPVC',
    keyword: 'Conserto de tubulação CPVC e registro geral',
    resumo: 'Conserto de tubulação CPVC de água quente e de registro geral nessa linha.',
    metaDescription:
      'Conserto de tubulação CPVC e de registro geral em São Paulo. Vazamento em água quente? Encanador 24h com garantia.',
    icon: 'pipe',
    intro: [
      'O CPVC é um PVC próprio para água quente, comum em linhas de aquecedor a gás e boiler. Ele usa conexões e adesivo específicos, e não pode ser misturado com PVC comum.',
      'Consertamos vazamentos em tubulação CPVC e trocamos registros gerais instalados nessa linha, mantendo a instalação dentro do padrão correto para água quente.',
    ],
    sinais: [
      'Vazamento perto do aquecedor ou boiler',
      'Registro geral pingando ou travado',
      'Cano bege ou creme com conexões soltas',
    ],
    comoFazemos: [
      'Identificamos o material e o ponto do problema',
      'Substituímos o trecho ou o registro com peças próprias para CPVC',
      'Respeitamos o tempo de cura do adesivo',
      'Testamos com água quente em funcionamento',
    ],
    faq: [
      {
        q: 'Posso usar conexão de PVC comum no CPVC?',
        a: 'Não. O PVC comum não suporta água quente e pode deformar ou estourar. Sempre usamos peças próprias para CPVC.',
      },
    ],
  },
  {
    slug: 'conserto-de-prumada-pvc',
    nome: 'Conserto de Prumada de PVC',
    keyword: 'Conserto de prumada de PVC',
    resumo: 'Reparo em colunas verticais de água e esgoto em prédios e sobrados.',
    metaDescription:
      'Conserto de prumada de PVC em prédios e sobrados de São Paulo. Vazamento em coluna de água ou esgoto? Atendimento 24h com garantia.',
    icon: 'pipe',
    intro: [
      'A prumada é a coluna vertical que distribui água ou recolhe esgoto entre os andares de um prédio ou sobrado. Um vazamento nela afeta mais de uma unidade e precisa de reparo rápido.',
      'Atendemos condomínios, síndicos e moradores, com planejamento para interromper o abastecimento pelo menor tempo possível.',
    ],
    sinais: [
      'Infiltração no teto vinda do andar de cima',
      'Mancha que desce pela parede em vários andares',
      'Vazamento em shaft ou duto de tubulação',
    ],
    comoFazemos: [
      'Avaliamos a prumada e combinamos o horário com o condomínio',
      'Fechamos a coluna afetada e esvaziamos o trecho',
      'Substituímos as peças danificadas',
      'Religamos e testamos andar por andar',
    ],
    faq: [
      {
        q: 'Atendem condomínios?',
        a: 'Sim. Atendemos síndicos e administradoras e combinamos o melhor horário para a intervenção.',
      },
    ],
  },
  {
    slug: 'conserto-de-tubulacao-de-esgoto',
    nome: 'Conserto de Tubulação de Esgoto',
    keyword: 'Conserto de tubulação de esgoto PVC',
    resumo: 'Reparo de canos de esgoto quebrados, com vazamento ou mau cheiro.',
    metaDescription:
      'Conserto de tubulação de esgoto PVC em São Paulo. Cano quebrado, vazamento ou mau cheiro? Encanador 24h, chegamos em até 20 minutos.',
    icon: 'drain',
    intro: [
      'Vazamento de esgoto é urgente: além do mau cheiro, contamina o ambiente e danifica pisos e paredes. Canos de esgoto trincam por movimentação da estrutura, raízes ou desgaste das conexões.',
      'Fazemos a troca do trecho danificado com tubos e conexões de esgoto adequados e garantimos o caimento correto para o escoamento.',
    ],
    sinais: [
      'Cheiro de esgoto constante em algum cômodo',
      'Umidade escura no piso ou no rodapé',
      'Vazamento no teto embaixo de banheiros',
    ],
    comoFazemos: [
      'Localizamos o trecho danificado',
      'Substituímos tubos e conexões de esgoto',
      'Conferimos o caimento e a vedação',
      'Testamos o escoamento',
    ],
    faq: [
      {
        q: 'Vazamento de esgoto no teto é do meu apartamento?',
        a: 'Geralmente vem da unidade de cima ou da prumada do prédio. Fazemos a avaliação e indicamos de onde vem o problema.',
      },
    ],
  },
  {
    slug: 'troca-de-registro-geral',
    nome: 'Troca de Registro Geral',
    keyword: 'Troca de registro geral',
    resumo: 'Registro geral travado, pingando ou sem vedar? Fazemos a troca completa.',
    metaDescription:
      'Troca e conserto de registro geral em São Paulo. Registro travado, vazando ou que não fecha? Encanador 24h com garantia.',
    icon: 'valve',
    destaque: true,
    intro: [
      'O registro geral é o que permite fechar toda a água do imóvel numa emergência. Quando ele trava, pinga ou não veda mais, você fica sem controle se surgir um vazamento.',
      'Trocamos registros gerais de gaveta e de esfera, em PVC, cobre, PPR ou CPVC, deixando a instalação firme e funcionando.',
    ],
    sinais: [
      'Registro duro, que não gira',
      'Água continua passando mesmo com o registro fechado',
      'Gotejamento na haste ou na base',
    ],
    comoFazemos: [
      'Fechamos a água no cavalete ou na prumada',
      'Removemos o registro antigo',
      'Instalamos o novo registro com conexões adequadas',
      'Testamos abertura, fechamento e vedação',
    ],
    faq: [
      {
        q: 'É melhor trocar o registro inteiro ou só o reparo?',
        a: 'Depende do estado do corpo do registro. Quando só a vedação está gasta, trocamos o reparo. Se o corpo está danificado, a troca completa é mais segura.',
      },
    ],
  },
  {
    slug: 'troca-de-registro-de-chuveiro',
    nome: 'Troca de Registro de Chuveiro',
    keyword: 'Troca de registro e tubulação de chuveiro',
    resumo: 'Troca de registro de chuveiro pingando e da tubulação do ponto de banho.',
    metaDescription:
      'Troca de registro e tubulação de chuveiro em São Paulo. Chuveiro pingando ou registro vazando na parede? Encanador 24h.',
    icon: 'shower',
    intro: [
      'Chuveiro pingando com o registro fechado, registro vazando por dentro da parede ou mancha atrás do box são sinais de que o registro ou a tubulação do chuveiro precisam de atenção.',
      'Trocamos o reparo, o registro completo ou a tubulação do ponto de banho, com cuidado para preservar o revestimento ao redor.',
    ],
    sinais: [
      'Chuveiro pingando com o registro fechado',
      'Umidade na parede do lado de fora do box',
      'Registro frouxo ou girando em falso',
    ],
    comoFazemos: [
      'Avaliamos se o problema é o reparo, o registro ou o cano',
      'Fazemos a troca preservando ao máximo o azulejo',
      'Testamos água quente e fria',
      'Deixamos tudo limpo e funcionando',
    ],
    faq: [
      {
        q: 'Vai precisar quebrar o azulejo?',
        a: 'Para trocar só o reparo, não. Para trocar o registro inteiro ou a tubulação, pode ser preciso uma abertura pequena, que fazemos com cuidado.',
      },
    ],
  },
  {
    slug: 'conserto-de-caixa-acoplada',
    nome: 'Conserto de Caixa Acoplada',
    keyword: 'Conserto de caixa acoplada',
    resumo: 'Caixa acoplada vazando, enchendo sem parar ou sem descarga? Resolvemos na hora.',
    metaDescription:
      'Conserto de caixa acoplada em São Paulo. Vazando no vaso, enchendo sem parar ou sem descarga? Encanador 24h, chegamos em até 20 minutos.',
    icon: 'toilet',
    destaque: true,
    intro: [
      'Caixa acoplada que fica escorrendo água no vaso, que não para de encher ou que não dá descarga desperdiça centenas de litros por dia e pesa na conta de água.',
      'Trocamos boia, comporta, mecanismo de entrada e saída e vedações, com peças compatíveis com a marca e o modelo do seu vaso.',
    ],
    sinais: [
      'Água escorrendo no vaso o tempo todo',
      'Caixa enchendo sem parar ou demorando para encher',
      'Botão de descarga solto ou travado',
      'Vazamento entre a caixa e o vaso',
    ],
    comoFazemos: [
      'Identificamos a peça com defeito',
      'Substituímos o mecanismo ou a vedação',
      'Regulamos o nível de água',
      'Testamos várias descargas seguidas',
    ],
    faq: [
      {
        q: 'Precisa trocar o vaso inteiro?',
        a: 'Quase nunca. Na maioria dos casos basta trocar o mecanismo interno ou as vedações da caixa acoplada.',
      },
    ],
  },
  {
    slug: 'valvula-hydra',
    nome: 'Válvula Hydra',
    keyword: 'Conserto e troca de válvula Hydra',
    resumo: 'Válvula de descarga disparando, vazando ou fraca? Reparo e troca de Hydra Luxo.',
    metaDescription:
      'Conserto e troca de válvula de descarga Hydra e Hydra Luxo em São Paulo. Descarga disparando ou vazando? Encanador 24h com garantia.',
    icon: 'valve',
    intro: [
      'A válvula de descarga de parede, como a Hydra Luxo, pode disparar sozinha, ficar vazando no vaso ou perder força com o tempo. Na maioria das vezes, o problema está no reparo interno.',
      'Fazemos a regulagem, a troca do reparo ou a substituição completa da válvula, incluindo o acabamento.',
    ],
    sinais: [
      'Descarga disparando e não parando',
      'Água escorrendo no vaso sem acionar',
      'Descarga fraca ou acionamento duro',
      'Vazamento no botão de acabamento',
    ],
    comoFazemos: [
      'Fechamos o registro da válvula',
      'Avaliamos se é regulagem, reparo ou troca completa',
      'Instalamos as peças compatíveis com o modelo',
      'Regulamos a vazão e testamos',
    ],
    faq: [
      {
        q: 'O reparo da Hydra é igual para todos os modelos?',
        a: 'Não. Existem reparos diferentes para cada linha e bitola. Identificamos o modelo e levamos a peça certa.',
      },
    ],
  },
  {
    slug: 'sifao-de-pia',
    nome: 'Sifão de Pia',
    keyword: 'Troca de sifão de pia',
    resumo: 'Troca de sifão de pia e lavatório vazando, quebrado ou com mau cheiro.',
    metaDescription:
      'Troca e conserto de sifão de pia e lavatório em São Paulo. Vazamento embaixo da pia ou mau cheiro? Encanador 24h.',
    icon: 'drain',
    intro: [
      'Vazamento embaixo da pia, armário molhado ou cheiro de esgoto na cozinha ou no banheiro costumam ter origem no sifão: peça que pode rachar, soltar ou perder a vedação.',
      'Trocamos sifões sanfonados, rígidos e de metal, ajustando a ligação com a válvula da pia e com o esgoto.',
    ],
    sinais: [
      'Armário embaixo da pia molhado',
      'Mau cheiro saindo pelo ralo da pia',
      'Sifão rachado ou com emenda solta',
    ],
    comoFazemos: [
      'Removemos o sifão antigo e limpamos as conexões',
      'Instalamos o sifão novo com vedação correta',
      'Ajustamos a altura e o encaixe no esgoto',
      'Testamos com a pia cheia',
    ],
    faq: [
      {
        q: 'Sifão sanfonado é ruim?',
        a: 'Ele funciona, mas acumula mais resíduo e entope com mais facilidade. Quando possível, recomendamos o sifão rígido.',
      },
    ],
  },
  {
    slug: 'troca-de-reparo-de-torneira',
    nome: 'Troca de Reparo de Torneira',
    keyword: 'Troca de reparo de torneira',
    resumo: 'Torneira pingando ou girando em falso? Troca de reparo e de torneira.',
    metaDescription:
      'Troca de reparo de torneira em São Paulo. Torneira pingando ou girando em falso? Encanador 24h, chegamos em até 20 minutos.',
    icon: 'faucet',
    intro: [
      'Uma torneira pingando pode desperdiçar dezenas de litros por dia. Na maioria das vezes, a causa é o reparo (vedante ou mecanismo cerâmico) gasto.',
      'Identificamos o tipo de reparo da sua torneira e fazemos a troca, ou a substituição completa da torneira se for o caso.',
    ],
    sinais: [
      'Torneira pingando mesmo fechada',
      'Volante girando em falso',
      'Vazamento pela base da torneira',
    ],
    comoFazemos: [
      'Fechamos o registro do ambiente',
      'Identificamos o modelo do reparo',
      'Trocamos o reparo ou a torneira',
      'Testamos fechamento e vazão',
    ],
    faq: [
      {
        q: 'Vale a pena trocar o reparo ou a torneira inteira?',
        a: 'Se o corpo da torneira está bom, a troca do reparo resolve e sai mais em conta. Avaliamos e indicamos a melhor opção.',
      },
    ],
  },
  {
    slug: 'instalacao-de-caixa-dagua',
    nome: 'Instalação de Caixa d’Água',
    keyword: 'Instalação de caixa d’água',
    resumo: 'Instalação e troca de caixa d’água com boia, extravasor e ligações completas.',
    metaDescription:
      'Instalação e troca de caixa d’água em São Paulo. Ligação de entrada, saída, boia e extravasor. Encanador com garantia.',
    icon: 'tank',
    intro: [
      'Caixa d’água rachada, sem tampa adequada ou pequena demais para a casa compromete o abastecimento e a qualidade da água.',
      'Fazemos a instalação ou troca da caixa d’água com todas as ligações: entrada, saída, boia, extravasor (ladrão) e limpeza.',
    ],
    sinais: [
      'Caixa d’água rachada ou vazando',
      'Falta de água frequente',
      'Boia que não fecha e ladrão escorrendo',
    ],
    comoFazemos: [
      'Avaliamos a base e o espaço disponível',
      'Instalamos a caixa com adaptadores e flanges',
      'Ligamos entrada, saídas, boia e extravasor',
      'Enchemos e testamos todas as ligações',
    ],
    faq: [
      {
        q: 'Qual o tamanho ideal de caixa d’água?',
        a: 'Depende do número de moradores e do consumo. Como referência, considere cerca de 150 a 200 litros por pessoa por dia. Ajudamos a dimensionar.',
      },
    ],
  },
  {
    slug: 'instalacao-de-bomba-pressurizadora',
    nome: 'Bomba Pressurizadora',
    keyword: 'Instalação de bomba pressurizadora',
    resumo: 'Chuveiro fraco? Instalamos bomba pressurizadora para melhorar a pressão da água.',
    metaDescription:
      'Instalação de bomba pressurizadora em São Paulo. Chuveiro e torneiras com pouca pressão? Encanador com garantia.',
    icon: 'pump',
    intro: [
      'Casas e apartamentos de último andar costumam sofrer com pouca pressão de água: chuveiro fraco, aquecedor que não liga e torneiras com vazão baixa.',
      'Instalamos bomba pressurizadora dimensionada para o seu consumo, com ligação hidráulica completa e regulagem.',
    ],
    sinais: [
      'Chuveiro fraco, principalmente no andar de cima',
      'Aquecedor a gás que não acende por falta de pressão',
      'Torneiras com pouca vazão',
    ],
    comoFazemos: [
      'Avaliamos a instalação e a demanda de água',
      'Indicamos o modelo adequado',
      'Instalamos com registros e by-pass',
      'Regulamos e testamos todos os pontos',
    ],
    faq: [
      {
        q: 'Bomba pressurizadora funciona com água da rua?',
        a: 'O recomendado é instalar após a caixa d’água. Avaliamos a sua instalação para indicar a ligação correta.',
      },
    ],
  },
  {
    slug: 'instalacao-de-filtro',
    nome: 'Instalação de Filtro',
    keyword: 'Instalação de filtro de água',
    resumo: 'Instalação de filtros e purificadores na pia ou na entrada de água.',
    metaDescription:
      'Instalação de filtro de água e purificador em São Paulo. Na pia ou na entrada geral. Encanador com garantia.',
    icon: 'filter',
    intro: [
      'Instalar um filtro corretamente evita vazamentos e garante que ele funcione como deve. Instalamos filtros de pia, purificadores e filtros de entrada (pré-filtro) para a casa toda.',
      'Fazemos a derivação na tubulação, a fixação e o teste de vazão, deixando tudo pronto para uso.',
    ],
    sinais: [
      'Comprou um filtro e precisa instalar',
      'Água com resíduos ou cor alterada',
      'Filtro antigo vazando nas conexões',
    ],
    comoFazemos: [
      'Escolhemos o melhor ponto de instalação',
      'Fazemos a derivação com conexões adequadas',
      'Fixamos o filtro com segurança',
      'Testamos vazão e vedação',
    ],
    faq: [
      {
        q: 'Vocês vendem o filtro?',
        a: 'Não. Trabalhamos apenas com o serviço. Você compra o modelo de sua preferência e nós fazemos a instalação.',
      },
    ],
  },
];

export const servicosDestaque = servicos.filter((s) => s.destaque);

export function getServico(slug: string) {
  return servicos.find((s) => s.slug === slug);
}
