import { readFileSync } from 'node:fs';

import type { GameType } from '../../src/app/types/game';

export interface SeedGame {
  type: GameType;
  name: string;
  /** Serialized the same way the upload endpoints store game content. */
  content: object;
  svg: string | null;
}

function readSvg(fileName: string): string {
  return readFileSync(new URL(fileName, import.meta.url), 'utf8');
}

export const seedGames: SeedGame[] = [
  {
    type: 'quiz',
    name: 'Wymień planety Układu Słonecznego',
    content: {
      question: 'Wymień planety Układu Słonecznego',
      answers: ['Merkury', 'Wenus', 'Ziemia', 'Mars', 'Jowisz', 'Saturn', 'Uran', 'Neptun'],
    },
    svg: null,
  },
  {
    type: 'quiz',
    name: 'Wymień znaki zodiaku',
    content: {
      question: 'Wymień znaki zodiaku',
      answers: [
        'Baran',
        'Byk',
        'Bliźnięta',
        'Rak',
        'Lew',
        'Panna',
        'Waga',
        'Skorpion',
        'Strzelec',
        'Koziorożec',
        'Wodnik',
        'Ryby',
      ],
    },
    svg: null,
  },
  {
    type: 'matchingQuiz',
    name: 'Symbole pierwiastków chemicznych',
    content: {
      question: 'Jakie pierwiastki kryją się pod tymi symbolami?',
      headers: ['Symbol', 'Pierwiastek'],
      keys: ['H', 'O', 'C', 'N', 'Na', 'K', 'Ca', 'Fe', 'Ag', 'Au'],
      answers: [
        'Wodór',
        'Tlen',
        'Węgiel',
        'Azot',
        'Sód',
        'Potas',
        'Wapń',
        'Żelazo',
        'Srebro',
        'Złoto',
      ],
    },
    svg: null,
  },
  {
    type: 'matchingQuiz',
    name: 'Autorzy polskich książek',
    content: {
      question: 'Kto napisał te książki?',
      headers: ['Dzieło', 'Autor'],
      keys: ['Pan Tadeusz', 'Lalka', 'Quo vadis', 'Chłopi', 'Balladyna', 'Wesele', 'Nad Niemnem'],
      answers: [
        'Mickiewicz',
        'Prus',
        'Sienkiewicz',
        'Reymont',
        'Słowacki',
        'Wyspiański',
        'Orzeszkowa',
      ],
    },
    svg: null,
  },
  {
    type: 'map',
    name: 'Kontynenty',
    content: {
      africa: 'Afryka',
      antarctica: 'Antarktyda',
      asia: 'Azja',
      europe: 'Europa',
      'north-america': 'Ameryka Północna',
      oceania: 'Australia',
      'south-america': 'Ameryka Południowa',
    },
    svg: readSvg('./continents.svg'),
  },
];
