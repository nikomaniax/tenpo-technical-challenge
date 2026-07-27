import { toGame, toGamesPage, toThumbnailUrl, type RawgGameDto } from './gameMapper';

const ORIGINAL_IMAGE =
  'https://media.rawg.io/media/games/456/456dea5e1c7e3cd07060c14e96612001.jpg';
const RESIZED_IMAGE =
  'https://media.rawg.io/media/resize/420/-/games/456/456dea5e1c7e3cd07060c14e96612001.jpg';

function makeDto(overrides: Partial<RawgGameDto> = {}): RawgGameDto {
  return {
    id: 3498,
    name: 'Grand Theft Auto V',
    released: '2013-09-17',
    rating: 4.47,
    background_image: ORIGINAL_IMAGE,
    genres: [{ id: 4, name: 'Action' }],
    ...overrides,
  };
}

describe('toThumbnailUrl', () => {
  it('inserta el segmento de resize, que es lo que baja la portada de 412 KB a 24 KB', () => {
    expect(toThumbnailUrl(ORIGINAL_IMAGE)).toBe(RESIZED_IMAGE);
  });

  it('es idempotente sobre una URL ya redimensionada', () => {
    expect(toThumbnailUrl(RESIZED_IMAGE)).toBe(RESIZED_IMAGE);
  });

  it('devuelve null cuando el juego no tiene portada', () => {
    expect(toThumbnailUrl(null)).toBeNull();
    expect(toThumbnailUrl(undefined)).toBeNull();
  });

  it('deja intacta una URL que no sea del CDN de RAWG', () => {
    const externa = 'https://example.com/portada.jpg';
    expect(toThumbnailUrl(externa)).toBe(externa);
  });
});

describe('toGame', () => {
  it('extrae el anio y aplana los generos', () => {
    const game = toGame(makeDto());

    expect(game.releaseYear).toBe('2013');
    expect(game.genres).toEqual(['Action']);
    expect(game.thumbnailUrl).toBe(RESIZED_IMAGE);
  });

  it('trata el rating 0 de RAWG como "sin votos" y no como una nota de cero', () => {
    expect(toGame(makeDto({ rating: 0 })).rating).toBeNull();
    expect(toGame(makeDto({ rating: 4.47 })).rating).toBe(4.47);
  });

  it('tolera juegos sin fecha ni generos', () => {
    const game = toGame(makeDto({ released: null, genres: undefined }));

    expect(game.releaseYear).toBeNull();
    expect(game.genres).toEqual([]);
  });
});

describe('toGamesPage', () => {
  it('marca que hay siguiente pagina segun el campo next', () => {
    const conSiguiente = toGamesPage({
      count: 350000,
      next: 'https://api.rawg.io/api/games?page=2',
      previous: null,
      results: [makeDto()],
    });

    expect(conSiguiente.hasNextPage).toBe(true);
    expect(conSiguiente.totalCount).toBe(350000);
    expect(conSiguiente.games).toHaveLength(1);

    const ultima = toGamesPage({ count: 1, next: null, previous: null, results: [] });
    expect(ultima.hasNextPage).toBe(false);
  });
});
