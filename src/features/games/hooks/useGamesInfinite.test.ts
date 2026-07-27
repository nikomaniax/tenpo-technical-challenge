import { getNextPageParam } from './useGamesInfinite';

describe('getNextPageParam', () => {
  it('avanza a la pagina siguiente mientras RAWG reporte que quedan mas', () => {
    expect(getNextPageParam({ hasNextPage: true }, [], 1)).toBe(2);
    expect(getNextPageParam({ hasNextPage: true }, [], 49)).toBe(50);
  });

  it('devuelve undefined en la ultima pagina para detener el scroll infinito', () => {
    expect(getNextPageParam({ hasNextPage: false }, [], 50)).toBeUndefined();
  });
});
