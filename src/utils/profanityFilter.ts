// Filtro de moderación verbal para el chat en vivo de Sónica Radio

const BAD_WORDS = [
  // Groserías, insultos y malas palabras en español
  'boludo', 'boluda', 'pelotudo', 'pelotuda', 'puta', 'puto', 'putos', 'putas', 'putita', 'putito',
  'mierda', 'concha', 'conchuda', 'conchudo', 'verga', 'pija', 'poronga', 'pito', 'paja', 'pajero', 'pajera',
  'orto', 'sorete', 'chupa', 'chupala', 'chupame', 'chupame la', 'mamada', 'mamaguevo', 'mamaguevo',
  'hijo de puta', 'hijo de perra', 'hijodeputa', 'hijodeperra', 'forro', 'forra', 'cagon', 'cagona',
  'maldito', 'maldita', 'imbecil', 'idiota', 'estupido', 'estupida', 'tarado', 'tarada', 'mogolico', 'mogolica',
  'retrasado', 'retrasada', 'maricon', 'trolo', 'trola', 'culiado', 'culiada', 'culiao', 'culia',
  'pendejo', 'pendeja', 'chingar', 'chinga', 'chingada', 'chingado', 'cabron', 'cabrona', 'carajo',
  'tetas', 'pene', 'vagina', 'clitoris', 'ano', 'sexo', 'porno', 'puterio', 'guarra', 'ramera',
  
  // Modismos adicionales de alta agresividad
  'chupamedias', 'malnacido', 'desgraciado', 'mariconazo', 'soplaipipas', 'chupapijas', 'chupapija',

  // Inglés común
  'fuck', 'fucking', 'fucker', 'shit', 'bitch', 'asshole', 'bastard', 'dick', 'cock', 'pussy', 'cunt', 'whore', 'slut'
];

/**
 * Normaliza texto para detectar variaciones con acentos o sustituciones típicas
 */
function normalizeText(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remover tildes
    .replace(/@/g, 'a')
    .replace(/!/g, 'i')
    .replace(/\$/g, 's')
    .replace(/0/g, 'o')
    .replace(/1/g, 'i')
    .replace(/3/g, 'e')
    .replace(/4/g, 'a')
    .replace(/5/g, 's')
    .replace(/7/g, 't');
}

/**
 * Censa o filtra groserías en un texto reemplazando las palabras prohibidas por asteriscos
 */
export function filterProfanity(text: string): { cleanText: string; isProfane: boolean; flaggedWords: string[] } {
  if (!text) return { cleanText: text, isProfane: false, flaggedWords: [] };

  let isProfane = false;
  const flaggedWords: string[] = [];
  let resultText = text;

  const normalized = normalizeText(text);

  BAD_WORDS.forEach(badWord => {
    const escaped = badWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Coincidencia por palabra o plural simple
    const regex = new RegExp(`\\b${escaped}\\b|\\b${escaped}s\\b`, 'gi');
    
    if (regex.test(normalized) || normalized.includes(badWord)) {
      isProfane = true;
      if (!flaggedWords.includes(badWord)) {
        flaggedWords.push(badWord);
      }
    }

    // Reemplaza en el texto original preservando longitud
    const replaceRegex = new RegExp(`\\b${escaped}\\b|\\b${escaped}s\\b`, 'gi');
    resultText = resultText.replace(replaceRegex, (match) => {
      if (match.length <= 2) return '**';
      return match[0] + '*'.repeat(match.length - 2) + match[match.length - 1];
    });
  });

  return { cleanText: resultText, isProfane, flaggedWords };
}

export function containsProfanity(text: string): boolean {
  return filterProfanity(text).isProfane;
}
