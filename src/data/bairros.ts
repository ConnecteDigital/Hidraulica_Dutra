export type Zona = 'Zona Norte' | 'Zona Oeste' | 'Zona Sul' | 'Zona Leste' | 'Centro';

export interface Bairro {
  slug: string;
  nome: string;
  zona: Zona;
  // Texto exclusivo da página para não repetir conteúdo entre bairros
  sobre: string;
  vizinhos: string[];
}

// Zonas em foco aparecem primeiro nas listagens
export const zonasPrioritarias: Zona[] = ['Zona Norte', 'Zona Oeste'];
export const ordemZonas: Zona[] = ['Zona Norte', 'Zona Oeste', 'Centro', 'Zona Sul', 'Zona Leste'];

export const bairros: Bairro[] = [
  {
    slug: 'santana',
    nome: 'Santana',
    zona: 'Zona Norte',
    sobre:
      'Santana mistura sobrados antigos e prédios novos ao redor da Rua Voluntários da Pátria e do metrô. Nas casas mais antigas são comuns tubulações de ferro galvanizado e cobre já desgastadas; nos prédios, chamados de vazamento em prumada e de caixa acoplada.',
    vizinhos: ['Tucuruvi', 'Casa Verde', 'Mandaqui', 'Vila Guilherme'],
  },
  {
    slug: 'pirituba',
    nome: 'Pirituba',
    zona: 'Zona Norte',
    sobre:
      'Pirituba é um bairro grande e residencial, com muitas casas, sobrados e condomínios. Atendemos desde desentupimento de esgoto e conserto de cano PVC até instalação de caixa d’água e bomba pressurizadora para as casas em ruas mais altas.',
    vizinhos: ['Jaraguá', 'Freguesia do Ó', 'São Domingos', 'Vila Jaguara'],
  },
  {
    slug: 'pinheiros',
    nome: 'Pinheiros',
    zona: 'Zona Oeste',
    sobre:
      'Em Pinheiros convivem prédios residenciais, casas reformadas e muitos comércios. Atendemos residências, restaurantes e escritórios com conserto de tubulação, troca de registro e desentupimento, inclusive fora do horário comercial.',
    vizinhos: ['Vila Madalena', 'Jardim Paulistano', 'Butantã', 'Alto de Pinheiros'],
  },
  {
    slug: 'perdizes',
    nome: 'Perdizes',
    zona: 'Zona Oeste',
    sobre:
      'Perdizes tem muitos prédios residenciais de médio e alto padrão em ruas de ladeira. Os chamados mais comuns são vazamento em tubulação embutida, troca de registro de chuveiro e válvula de descarga em apartamentos.',
    vizinhos: ['Pompeia', 'Sumaré', 'Barra Funda', 'Água Branca'],
  },
  {
    slug: 'higienopolis',
    nome: 'Higienópolis',
    zona: 'Centro',
    sobre:
      'Higienópolis concentra prédios antigos e bem conservados, muitos com tubulação original de cobre e ferro. Fazemos reparos cuidadosos, preservando pisos e revestimentos, e atendemos condomínios em consertos de prumada.',
    vizinhos: ['Consolação', 'Santa Cecília', 'Pacaembu', 'Perdizes'],
  },
  {
    slug: 'bela-vista',
    nome: 'Bela Vista',
    zona: 'Centro',
    sobre:
      'A Bela Vista, próxima à Avenida Paulista, tem muitos apartamentos compactos e prédios antigos. Atendemos vazamentos, desentupimentos e troca de registros com agilidade, inclusive em horários de pico e madrugada.',
    vizinhos: ['Liberdade', 'Consolação', 'Paraíso', 'Jardins'],
  },
  {
    slug: 'vila-mariana',
    nome: 'Vila Mariana',
    zona: 'Zona Sul',
    sobre:
      'A Vila Mariana combina casas tradicionais e prédios residenciais. Atendemos com frequência conserto de cano PVC, caixa acoplada e desentupimento de pias e ralos.',
    vizinhos: ['Paraíso', 'Aclimação', 'Ibirapuera', 'Saúde'],
  },
  {
    slug: 'moema',
    nome: 'Moema',
    zona: 'Zona Sul',
    sobre:
      'Moema é um bairro de prédios residenciais e comércio intenso. Os chamados mais comuns são vazamento em apartamento, conserto de tubulação PPR em prédios novos e troca de válvula Hydra.',
    vizinhos: ['Ibirapuera', 'Vila Nova Conceição', 'Campo Belo', 'Indianópolis'],
  },
  {
    slug: 'saude',
    nome: 'Saúde',
    zona: 'Zona Sul',
    sobre:
      'No bairro da Saúde há muitas casas e sobrados, além de condomínios verticais. Atendemos desde desentupimento de esgoto até instalação de caixa d’água e conserto de registro geral.',
    vizinhos: ['Vila Mariana', 'Jabaquara', 'Planalto Paulista', 'Ipiranga'],
  },
  {
    slug: 'brooklin',
    nome: 'Brooklin',
    zona: 'Zona Sul',
    sobre:
      'O Brooklin reúne prédios corporativos, apartamentos e casas. Atendemos residências e empresas com conserto de tubulação, troca de registro e desentupimento a qualquer hora.',
    vizinhos: ['Campo Belo', 'Itaim Bibi', 'Vila Olímpia', 'Santo Amaro'],
  },
  {
    slug: 'tatuape',
    nome: 'Tatuapé',
    zona: 'Zona Leste',
    sobre:
      'O Tatuapé cresceu com muitos prédios altos e ainda mantém ruas de casas e sobrados. Atendemos bomba pressurizadora, conserto de prumada e vazamentos em apartamentos.',
    vizinhos: ['Anália Franco', 'Carrão', 'Vila Formosa', 'Penha'],
  },
  {
    slug: 'mooca',
    nome: 'Mooca',
    zona: 'Zona Leste',
    sobre:
      'A Mooca é tradicional, com muitas casas antigas e prédios novos. Em imóveis antigos é comum trocar trechos de tubulação de ferro e cobre; nos novos, reparos em PPR e CPVC.',
    vizinhos: ['Belém', 'Brás', 'Ipiranga', 'Água Rasa'],
  },
];

export function bairroPath(b: Bairro) {
  return `/encanador-em-${b.slug}/`;
}

export function bairrosPorZona() {
  return ordemZonas
    .map((zona) => ({ zona, bairros: bairros.filter((b) => b.zona === zona) }))
    .filter((g) => g.bairros.length > 0);
}
