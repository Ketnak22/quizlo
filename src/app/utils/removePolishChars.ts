const POLISH_CHARS: Record<string, string> = {
  ą: 'a',
  ć: 'c',
  ę: 'e',
  ł: 'l',
  ń: 'n',
  ó: 'o',
  ś: 's',
  ź: 'z',
  ż: 'z',
  Ą: 'A',
  Ć: 'C',
  Ę: 'E',
  Ł: 'L',
  Ń: 'N',
  Ó: 'O',
  Ś: 'S',
  Ź: 'Z',
  Ż: 'Z',
};

/** Replaces Polish diacritics with ASCII letters, trims the text and collapses its whitespace. */
function removePolishChars(text: string): string {
  return text
    .normalize('NFC')
    .replace(/[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/g, (char) => POLISH_CHARS[char])
    .replace(/\s+/g, ' ')
    .trim();
}

export default removePolishChars;
