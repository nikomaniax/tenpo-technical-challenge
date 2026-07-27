# Tenpo Technical Challenge

App en React Native + TypeScript con login simulado, sesión persistente y un listado de más de 2.000 juegos traídos de una API pública.

Corre sobre Expo SDK 54 (React Native 0.81, React 19.1). Las credenciales de prueba son **demo@tenpo.com / Demo1234** y ya vienen escritas en el formulario, así que entrar es un solo toque.

## Probarlo sin instalar nada

Dejé la app desplegada acá:

**https://tenpo-technical-challenge.expo.app**

No es necesario instalar nada ni conseguir una API key, la puedes usar en cualquier navegador (movil o escritorio).

## Levantarlo local

```bash
npm install
cp .env.example .env      # hay que poner una key de RAWG adentro
npx expo start
```

Y escanear el QR con Expo Go. No hace falta compilar nada: todo lo nativo que uso (`flash-list`, `expo-image`, `expo-secure-store`) ya viene dentro de Expo Go.

La key de RAWG se obtiene gratis aqui: [rawg.io/apidocs](https://rawg.io/apidocs). Si falta o quedó el valor de ejemplo, la app se cae al arrancar con un mensaje explicando qué pasa, en vez de dejarte con una lista vacía y errores 401 que no dicen nada.

> Un detalle de la versión web: en el navegador no existe SecureStore, así que uso `localStorage`. Es un degradado a propósito y está aislado en [`secureStorage.ts`](src/shared/storage/secureStorage.ts). En el teléfono, el token va a Keychain o Keystore según la plataforma.

### Sobre la versión del SDK

Estoy usando Expo Go 54, es el ultimo disponible al publico. Lo probé en un iPhone 15 Pro con iOS 26.

`eas go` publica por TestFlight y exige membresía pagada del Apple Developer Program, y el simulador de iOS necesita macOS.


## Por qué RAWG

Mi primera idea fue PokeAPI, pero al revisarla me di cuenta de que `/pokemon` tiene 1.351 entradas y el challenge pide mínimo 2.000. Así que fui probando alternativas:

| API                     | Qué pasó                                                                                                               |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| PokeAPI `/item`         | Llega a 2.223, pero el listado solo trae `name` y `url`. Para mostrar imágenes tendría que hacer una petición por fila |
| FreeToGame              | 647 juegos                                                                                                             |
| CheapShark              | Cloudflare bloquea las peticiones                                                                                      |
| Steam                   | Anda sin key, pero consulta app por app y no tiene paginación                                                          |
| Jikan                   | Se cayó con 504                                                                                                        |
| Scryfall, pokemontcg.io | 403, piden cabeceras específicas o key                                                                                 |
| NHTSA (autos)           | Estable, pero sin imágenes y con razones sociales del registro federal en vez de modelos                               |
| RAWG                    | 350.000 juegos, paginación real y portadas                                                                             |

RAWG pide una API key, cosa que al principio quise evitar, pero al final no es problema: la key viaja dentro del bundle, así que no necesita sacar la una propia.

### La optimización que más sirvió

Revisando cómo RAWG devuelve las portadas encontré que se pueden pedir redimensionadas metiendo `/resize/420/-/` en la ruta del CDN. Medí la misma imagen en ambas versiones:

- original: **412,7 KB**
- redimensionada: **24,7 KB**

Casi 17 veces menos. Para nuestra lista de 2.000 filas bajamos de ~825 MB a ~49 MB. Estar descargando una imagen de 4000 px para pintarla en un recuadro de 104 px era un desperdicio, de lejos.

La reescritura está en [`gameMapper.ts`](src/features/games/api/gameMapper.ts) y es idempotente, por si algún día RAWG empieza a devolver la URL ya redimensionada.

## Cómo manejo el estado

Separé tres cosas que suelen mezclarse:

- Los datos que vienen del servidor (el catálogo) viven en TanStack Query.
- La sesión vive en Zustand con el middleware `persist`.
- `useState` quedó solo para cosas locales de la UI.

Lo importante acá es que **la lista nunca se copia a `useState`**. Los datos se leen directo de la caché de Query. Duplicarlos en estado local es la forma clásica de terminar con dos fuentes de verdad que se desincronizan y con re-renders que no hacían falta.

### Zustand en vez de Context

Podría haber usado Context con `useReducer` y funcionaba igual, pero me topé con dos cosas concretas que lo hacían incómodo:

La primera es que [`httpClient`](src/shared/api/httpClient.ts) necesita el token y no es un componente, es un módulo suelto. Con Context tendría que haber armado un singleton aparte que duplica el estado. Con Zustand es `useAuthStore.getState()` y listo.

La segunda es que el middleware `persist` se conecta a SecureStore directo y avisa cuándo terminó de hidratar, que es lo que necesito para no mostrar el login parpadeando al abrir la app. Con Context ese efecto había que escribirlo a mano.

Los selectores tipo `useAuthStore(s => s.user)` evitan que cambiar un campo re-renderice a todos los que consumen el store.

### React Hook Form + Zod

Formik y Yup hacen básicamente lo mismo y son intercambiables por el resolver, así que tampoco es una decisión dramática. Me fui por Zod sobre todo porque los tipos salen del propio esquema con `z.infer`, entonces no se pueden desfasar de la validación. Además terminé reutilizando Zod fuera del formulario, para validar las variables de entorno al arrancar. Y Formik hace bastante que no tiene desarrollo activo.


### FlashList

Usé FlashList v2 porque recicla las vistas en lugar de montar y desmontar celdas. Pero el reciclaje solo rinde si lo acompañas de tres cosas:

Mantener la altura de fila constante ([`GAME_ROW_HEIGHT`](src/features/games/ui/GameRow.tsx)), porque una fila de alto variable obliga a medir en cada scroll. Pasarle `recyclingKey` a `expo-image`, porque sin eso se alcanza a ver la portada del juego anterior cuando la celda se recicla. Y dejar `memo` explícito en la fila: aunque tengo el React Compiler activo y memoiza el cuerpo del componente, esa barrera evita entrar siquiera cuando la celda se recicla con el mismo juego.

## Estructura

```
src/
├── app/                    # rutas de expo-router
│   ├── _layout.tsx         # providers y splash hasta hidratar
│   ├── login.tsx
│   └── (app)/index.tsx     # home privada
├── features/
│   ├── auth/               # api · model · state · ui
│   └── games/              # api · model · hooks · ui
└── shared/                 # api · config · storage · ui
```

Agrupé por dominio y dejé las capas adentro de cada feature. Con la organización opuesta (`api/`, `components/`, `hooks/` colgando de la raíz) cada feature nueva te obliga a tocar cinco carpetas, y cada capa crece a lo ancho sin freno. Así, una feature se lee, se mueve o se borra completa.

Lo dejé además configurado en [`eslint.config.js`](eslint.config.js) con `import/no-restricted-paths`: una feature no puede importar cosas internas de otra, y `shared` no puede depender de una feature. Si alguien lo intenta, el lint falla. Me parecía mejor que dejarlo escrito como convención y esperar que se respete.

## La sesión

El login está en [`authService.ts`](src/features/auth/api/authService.ts), simula unos 800 ms de latencia y devuelve una sesión o tira `InvalidCredentialsError`. Toda la app conoce la autenticación solo por esa firma, así que reemplazarlo por un backend de verdad es cambiar el cuerpo de esa función; ni el store ni las pantallas se enteran.

El token queda guardado en SecureStore, que en iOS es Keychain y en Android Keystore. En AsyncStorage habría quedado en texto plano.

Un detalle que se nota harto en el uso: el splash se mantiene hasta que `persist` termina de leer SecureStore. Sin eso, alguien que ya tenía sesión ve aparecer la pantalla de login por un instante antes de que lo saque, porque esa lectura es asíncrona.

Para proteger las rutas usé `Stack.Protected`, que mueve la frontera al árbol de navegación. La ruta privada directamente no está montada si no hay sesión, así que no hay forma de caer en ella.

Y el logout, además de limpiar el store y SecureStore, llama a `queryClient.clear()`. Si no, la caché del usuario anterior queda viva y la siguiente cuenta alcanza a ver sus datos mientras se revalidan.

## Cómo renderizo la lista

Scroll infinito con `useInfiniteQuery`, en páginas de 40, que es el máximo que acepta RAWG. El enunciado menciona lazy loading y virtualización entre las mejoras que valoran, así que fui por ahí.

Algunas decisiones puntuales:

El `AbortSignal` que entrega TanStack Query se propaga hasta el `fetch`, así que si sales de la pantalla las peticiones en vuelo se cancelan en vez de seguir gastando red y cuota de la API.

El `onEndReachedThreshold` está en media pantalla. Alcanza para que la página siguiente llegue antes de que el usuario toque el fondo, sin ponerse a pedir páginas que capaz nunca se ven.

Los reintentos son selectivos. Un 404 o un 401 son definitivos y reintentarlos solo retrasa el mensaje de error, así que solo reintento lo que puede ser pasajero: red, timeout y 5xx, con backoff exponencial.

Y si falla una página, lo que ya estaba pintado se queda. El error a pantalla completa aparece únicamente cuando todavía no hay ningún dato que mostrar.

## Sobre la API key

Está en `.env` como `EXPO_PUBLIC_RAWG_API_KEY` y el archivo está en `.gitignore`. Se valida con Zod al arrancar.

Dicho eso, prefiero ser claro con lo que eso protege y lo que no. Las variables `EXPO_PUBLIC_*` se inyectan en el bundle al compilar, o sea que la key igual viaja al cliente y se puede extraer de la app. Tenerla fuera del repo está bien y es lo mínimo, pero no la hace secreta en runtime.

Lo correcto sería un proxy propio que guarde la key en el servidor y exponga solo los endpoints que necesito. No lo hice porque me pareció desproporcionado para el alcance de esto, pero lo dejo dicho en vez de simular que el tema está resuelto. En este caso el riesgo es bajo: es una key gratuita, de solo lectura y con cuota de 20.000 peticiones al mes.

## Tests

```bash
npm test
```

Son 29 tests en 6 suites.

- **authStore**: las transiciones de estado, que el correo se normalice y que el logout efectivamente vacíe la caché de queries.
- **loginSchema**: que distinga un campo vacío de uno mal escrito.
- **gameMapper**: la reescritura a `/resize/420/-/`, que sea idempotente y qué pasa cuando el juego no tiene portada.
- **getNextPageParam**: que el scroll infinito se detenga en la última página. Es el bug clásico de esta funcionalidad y por eso lo saqué a una función aparte, para poder probarlo sin montar React ni tocar la red.
- **LoginForm**: que un formulario inválido ni siquiera llame a `login`.
- **GameList**: primera página, carga de la siguiente, fin de datos y el estado de error con reintento.

Los que tocan red mockean `fetch` directo. Pensé en MSW pero lo dejé fuera: con seis tests todavía no se justifica, empieza a rendir más adelante.

## Posibles mejoras

Me pareció que meter i18n, observabilidad o un monorepo en una app de dos pantallas iba a leerse más como falta de criterio que como visión. El filtro que usé fue: entra si cuesta menos de treinta líneas y me ahorra una refactorización cara después. Lo demás queda anotado:

- Un proxy para la key de RAWG.
- Refresh token. El punto de enganche `onUnauthorized` ya está puesto en `httpClient`, faltaría la lógica.
- Toggle manual de tema. Los tokens ya están definidos en claro y oscuro y se consumen con `useTheme()`, así que sería agregar el switch.
- Búsqueda y filtros. El enunciado no los pedía.
- Pantalla de detalle. La fábrica de query keys ya contempla `gameKeys.detail(id)`.
- MSW, CI, Sentry, i18n, skeletons y e2e con Maestro.

## Comandos

|                     |                                              |
| ------------------- | -------------------------------------------- |
| `npm start`         | Servidor de desarrollo                       |
| `npm test`          | Tests                                        |
| `npm run lint`      | ESLint, incluidas las reglas de arquitectura |
| `npm run typecheck` | `tsc --noEmit`                               |

---

Los datos de juegos vienen de [RAWG](https://rawg.io/apidocs).
