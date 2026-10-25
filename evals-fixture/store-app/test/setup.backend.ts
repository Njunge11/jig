import { pushSchema } from "drizzle-kit/api";
import * as schema from "@/db/schema";
import { testDb } from "./db";
import { statementCount } from "./statement-counter";

beforeAll(async () => {
  const { apply } = await pushSchema(schema, testDb as never);
  await apply();
});

beforeEach(() => statementCount.reset());
