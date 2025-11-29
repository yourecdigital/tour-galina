// Утилиты для работы с турами

export interface Tour {
  id: number;
  title: string;
  description: string | null;
  price: number | null;
  image_url: string | null;
  photos: string[] | null;
  videos: string[] | null;
  category_id: number | null;
  duration: string | null;
  location: string | null;
  slug: string | null;
  created_at: string;
  updated_at: string;
}

// Парсинг тура из БД (преобразует JSON строки в массивы)
export function parseTour(tour: any): Tour {
  return {
    ...tour,
    photos: tour.photos ? (typeof tour.photos === 'string' ? JSON.parse(tour.photos) : tour.photos) : null,
    videos: tour.videos ? (typeof tour.videos === 'string' ? JSON.parse(tour.videos) : tour.videos) : null,
  };
}

// Парсинг массива туров
export function parseTours(tours: any[]): Tour[] {
  return tours.map(parseTour);
}

