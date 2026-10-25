import type { Logger } from "drizzle-orm/logger";

let count = 0;

export const countingLogger: Logger = {
  logQuery() {
    count += 1;
  },
};

export function statementCount(): number {
  return count;
}
statementCount.reset = () => {
  count = 0;
};
