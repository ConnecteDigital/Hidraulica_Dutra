import type { ImageMetadata } from 'astro';

// Fotos reais de serviços feitos, uma por serviço (src/assets/fotos/<slug>.jpg).
// Os originais ficam em fotos/<slug>/ na raiz do repositório.
const arquivos = import.meta.glob<{ default: ImageMetadata }>('../assets/fotos/*.jpg', { eager: true });

const alts: Record<string, string> = {
  desentupimento: 'Encanador da Dutra Hidráulica usando máquina de desentupimento em um imóvel',
  'conserto-de-tubulacao-pvc': 'Conserto de tubulação PVC embutida com registro novo instalado na parede',
  'furo-em-cano-pvc': 'Cano PVC furado consertado com conexões novas dentro da parede',
  'furo-em-cano-de-cobre': 'Canos de cobre emendados com luvas de latão após conserto de furo',
  'conserto-de-cano-ppr': 'Trecho de cano trocado dentro da parede durante conserto de vazamento',
  'conserto-de-tubulacao-cpvc': 'Conexão nova instalada em tubulação de água após conserto',
  'conserto-de-prumada-pvc': 'Prumada de PVC aberta na parede com trecho substituído',
  'conserto-de-tubulacao-de-esgoto': 'Tubulação de esgoto PVC refeita junto à parede do banheiro',
  'troca-de-registro-geral': 'Registro geral novo instalado na tubulação embutida na parede',
  'troca-de-registro-de-chuveiro': 'Troca de registro e tubulação de chuveiro com a parede aberta',
  'conserto-de-caixa-acoplada': 'Mecanismo novo de entrada e saída instalado dentro da caixa acoplada',
  'valvula-hydra': 'Válvula de descarga Hydra em manutenção na parede do banheiro',
  'sifao-de-pia': 'Sifão novo instalado embaixo da pia',
  'troca-de-reparo-de-torneira': 'Torneira de lavatório com reparos novos instalados',
  'instalacao-de-caixa-dagua': 'Caixas d’água instaladas na laje de um imóvel em São Paulo',
  'instalacao-de-bomba-pressurizadora': 'Bomba instalada em reservatório de concreto',
  'instalacao-de-filtro': 'Filtro de água instalado na entrada da tubulação',
};

export interface Foto {
  src: ImageMetadata;
  alt: string;
}

export function fotoDoServico(slug: string): Foto | undefined {
  const mod = arquivos[`../assets/fotos/${slug}.jpg`];
  if (!mod) return undefined;
  return { src: mod.default, alt: alts[slug] ?? 'Serviço realizado pela Dutra Hidráulica' };
}
