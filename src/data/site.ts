// Dados centrais da empresa. Altere aqui e o site inteiro é atualizado.

// TODO: substituir pelo número real (formato: 55 + DDD + número, só dígitos)
const PHONE_DIGITS = '5511900000000';

export const site = {
  name: 'Hidráulica Dutra',
  legalName: 'Dutra Hidráulica',
  url: 'https://hidraulicadutra.com.br',
  city: 'São Paulo',
  state: 'SP',
  phoneDigits: PHONE_DIGITS,
  // Exibição: (11) 90000-0000
  phoneDisplay: `(${PHONE_DIGITS.slice(2, 4)}) ${PHONE_DIGITS.slice(4, 9)}-${PHONE_DIGITS.slice(9)}`,
  tel: `tel:+${PHONE_DIGITS}`,
  arrivalMinutes: 20,
  description:
    'Encanador 24 horas em São Paulo. Conserto de vazamentos, canos PVC, PPR, cobre e CPVC, desentupimento, registros, caixa d’água e mais. Chegamos em até 20 minutos, com garantia.',
};

export const DEFAULT_WHATSAPP_MESSAGE =
  'Olá! Vim pelo site da Hidráulica Dutra e preciso de um encanador.';

export function whatsappUrl(message: string = DEFAULT_WHATSAPP_MESSAGE) {
  return `https://api.whatsapp.com/send?phone=${site.phoneDigits}&text=${encodeURIComponent(message)}`;
}
