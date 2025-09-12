import { Migration } from '../types/migrations';
import { migration_001_init } from './migarations/001_init';
import { migration_002_better } from './migarations/002_better';

export const migrations: Migration[] = [
  migration_001_init,
  migration_002_better
];
