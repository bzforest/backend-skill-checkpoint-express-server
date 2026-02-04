// Create PostgreSQL Connection Pool here !
import * as pg from "pg";
const { Pool } = pg.default;

const connectionPool = new Pool({
  connectionString:
    "postgresql://postgres:bzforest@localhost:5432/BackEnd-Skillcheckpoint",
});

export default connectionPool;
