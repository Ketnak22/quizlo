import { readFileSync } from 'node:fs';

import type { GameType } from '../../src/app/types/game';

export interface SeedGame {
  id: string;
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
    id: 'seed-planets',
    type: 'quiz',
    name: 'Wymień planety Układu Słonecznego',
    content: {
      question: 'Wymień planety Układu Słonecznego',
      answers: ['Merkury', 'Wenus', 'Ziemia', 'Mars', 'Jowisz', 'Saturn', 'Uran', 'Neptun'],
    },
    svg: null,
  },
  {
    id: 'seed-poland-neighbours',
    type: 'quiz',
    name: 'Wymień sąsiadów Polski',
    content: {
      question: 'Wymień sąsiadów Polski',
      answers: ['Niemcy', 'Czechy', 'Słowacja', 'Ukraina', 'Białoruś', 'Litwa', 'Rosja'],
    },
    svg: null,
  },
  {
    id: 'seed-european-capitals',
    type: 'matchingQuiz',
    name: 'Stolice Europy',
    content: {
      question: 'Stolice Europy',
      headers: ['Kraj', 'Stolica'],
      keys: ['Polska', 'Niemcy', 'Francja', 'Hiszpania', 'Włochy', 'Czechy', 'Austria', 'Węgry'],
      answers: ['Warszawa', 'Berlin', 'Paryż', 'Madryt', 'Rzym', 'Praga', 'Wiedeń', 'Budapeszt'],
    },
    svg: null,
  },
  {
    id: 'seed-polish-literature',
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
    id: 'seed-continents',
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
  {
    id: 'seed-poland-voivodeships',
    type: 'map',
    name: 'Województwa Polski',
    content: {
      'PL-DS': 'Dolnośląskie',
      'PL-KP': 'Kujawsko-pomorskie',
      'PL-LB': 'Lubuskie',
      'PL-LD': 'Łódzkie',
      'PL-LU': 'Lubelskie',
      'PL-MA': 'Małopolskie',
      'PL-MZ': 'Mazowieckie',
      'PL-OP': 'Opolskie',
      'PL-PD': 'Podlaskie',
      'PL-PK': 'Podkarpackie',
      'PL-PM': 'Pomorskie',
      'PL-SK': 'Świętokrzyskie',
      'PL-SL': 'Śląskie',
      'PL-WN': 'Warmińsko-mazurskie',
      'PL-WP': 'Wielkopolskie',
      'PL-ZP': 'Zachodniopomorskie',
    },
    svg: readSvg('./voivodeships.svg'),
  },
];
