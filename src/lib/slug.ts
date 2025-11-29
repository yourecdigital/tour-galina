// Функция для транслитерации русского текста в латиницу
export function transliterate(text: string): string {
  const transliterationMap: { [key: string]: string } = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
    'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
    'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
    'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
    'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
    'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Yo',
    'Ж': 'Zh', 'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M',
    'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U',
    'Ф': 'F', 'Х': 'H', 'Ц': 'Ts', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Sch',
    'Ъ': '', 'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'Yu', 'Я': 'Ya'
  };

  return text
    .split('')
    .map(char => transliterationMap[char] || char)
    .join('');
}

// Генерация slug из текста
export function generateSlug(text: string): string {
  if (!text || typeof text !== 'string') {
    return 'tour';
  }
  
  const slug = transliterate(text)
    .toLowerCase()
    .trim()
    // Заменяем пробелы и специальные символы на дефисы
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  
  // Если slug пустой после обработки, возвращаем fallback
  return slug || 'tour';
}

// Генерация уникального slug (добавляет число если slug уже существует)
export function generateUniqueSlug(
  text: string,
  existingSlugs: string[],
  currentSlug?: string | null
): string {
  if (!text || typeof text !== 'string') {
    return 'tour';
  }

  let baseSlug = generateSlug(text);
  
  // Если это обновление и slug не изменился, возвращаем текущий
  if (currentSlug && baseSlug === currentSlug) {
    return currentSlug;
  }

  // Если slug пустой, используем fallback
  if (!baseSlug) {
    baseSlug = 'tour';
  }

  let slug = baseSlug;
  let counter = 1;

  // Проверяем уникальность, исключая текущий slug и null значения
  const slugsToCheck = existingSlugs.filter(s => s && s !== currentSlug);
  
  while (slugsToCheck.includes(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
    // Защита от бесконечного цикла
    if (counter > 1000) {
      slug = `${baseSlug}-${Date.now()}`;
      break;
    }
  }

  return slug;
}

