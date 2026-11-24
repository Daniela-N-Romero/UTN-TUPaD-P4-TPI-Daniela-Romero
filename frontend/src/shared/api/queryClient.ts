import { QueryClient } from '@tanstack/react-query';

// QueryClient no asume que la aplicación es la única fuente de verdad: 
// trata los datos remotos como una caché que puede quedarse obsoleta, 
// debe revalidarse y compartirse entre componentes sin duplicar peticiones

// Cuando creas, editas o eliminas un recurso (useMutation), QueryClient te permite 
// invalidar las consultas relacionadas para que se vuelvan a pedir o 
// actualizar la caché de forma optimista/directa.

// ¿Cuándo aporta más valor?
// Cuando tenés datos compartidos entre varias vistas o componentes que vienen de una API.
// Cuando querés evitar useEffect manuales llenos de isLoading, error, cancelaciones y estados duplicados.
// Cuando necesitás que, tras guardar o borrar algo, el resto de la pantalla se mantenga consistente sin recargar la página.

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,  //Si una consulta falla al pedir datos, TanStack Query la reintentará una sola vez
      refetchOnWindowFocus: false, //Desactiva la revalidación automática cuando el usuario cambia de pestaña o vuelve a enfocar la ventana del navegador
      staleTime: 1000 * 30,  //los datos obtenidos se consideran "frescos" durante 30 segundos
    },
    mutations: {
      retry: 0,  //Las operaciones de escritura o cambio de estado (POST, PUT, PATCH, DELETE) no se reintentan automáticamente si fallan
    },
  },
});