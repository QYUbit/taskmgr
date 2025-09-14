import { Migration } from '../types/migrations';
import { migration_001_init } from './migarations/001_init';

export const migrations: Migration[] = [
  migration_001_init,
];
