import { act, screen, waitFor } from '@testing-library/react-native';

import { renderWithProviders } from '@/shared/test/renderWithProviders';

import type { RawgGameDto, RawgPageDto } from '../api/gameMapper';
import { GameList } from './GameList';

function makeGame(id: number): RawgGameDto {
  return {
    id,
    name: `Juego ${id}`,
    released: '2013-09-17',
    rating: 4.5,
    background_image: `https://media.rawg.io/media/games/${id}/portada.jpg`,
    genres: [{ id: 4, name: 'Action' }],
  };
}

function makePage(ids: number[], next: string | null): RawgPageDto {
  return {
    count: 350000,
    next,
    previous: null,
    results: ids.map(makeGame),
  };
}

function mockFetchOnce(page: RawgPageDto) {
  (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
    status: 200,
    json: async () => page,
  });
}

describe('GameList', () => {
  beforeEach(() => {
    globalThis.fetch = jest.fn();
  });

  it('pinta la primera pagina y pide 40 elementos con la key del entorno', async () => {
    mockFetchOnce(makePage([1, 2, 3], 'https://api.rawg.io/api/games?page=2'));

    await renderWithProviders(<GameList />);

    expect(await screen.findByText('Juego 1')).toBeOnTheScreen();
    expect(screen.getByText('Juego 3')).toBeOnTheScreen();

    const [url] = (globalThis.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain('page=1');
    expect(url).toContain('page_size=40');
    expect(url).toContain('key=test-key');
  });

  it('trae la pagina siguiente al llegar al final de la lista', async () => {
    mockFetchOnce(makePage([1, 2], 'https://api.rawg.io/api/games?page=2'));

    await renderWithProviders(<GameList />);
    await screen.findByText('Juego 1');

    mockFetchOnce(makePage([3, 4], 'https://api.rawg.io/api/games?page=3'));

    await act(async () => {
      screen.getByTestId('game-list').props.onEndReached();
    });

    expect(await screen.findByText('Juego 3')).toBeTruthy();

    const [segundaUrl] = (globalThis.fetch as jest.Mock).mock.calls[1];
    expect(segundaUrl).toContain('page=2');
  });

  it('deja de pedir paginas cuando RAWG informa que no quedan mas', async () => {
    mockFetchOnce(makePage([1, 2], null));

    await renderWithProviders(<GameList />);
    await screen.findByText('Juego 1');

    await act(async () => {
      screen.getByTestId('game-list').props.onEndReached();
    });

    expect(await screen.findByText('No hay mas resultados')).toBeTruthy();
    expect(globalThis.fetch as jest.Mock).toHaveBeenCalledTimes(1);
  });

  it('muestra un estado de error con reintento si la primera carga falla', async () => {
    (globalThis.fetch as jest.Mock).mockRejectedValue(new TypeError('Network request failed'));

    await renderWithProviders(<GameList />);

    await waitFor(() =>
      expect(
        screen.getByText('No hay conexion. Revisa tu red e intenta de nuevo.')
      ).toBeTruthy()
    );
    expect(screen.getByText('Reintentar')).toBeTruthy();
  });
});
