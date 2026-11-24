// Pages
export { default as AdminCategoriasPage } from './pages/AdminCategoriasPage';

// Hooks
export { 
    useCategorias,
    useCategoriasList,
    CATEGORIAS_QUERY_KEY
} from './hooks/useCategorias';

// Services
export { getCategorias } from './api/categoria.service';

// Components
export { CategoriaList } from './components/CategoriaList';
export { CategoriaModal } from './components/CategoriaModal';

// Types
export type * from './types/categoria.types';