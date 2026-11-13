/**
 * The fixed data of the flows. A flow removes the data that it makes. Data
 * that it cannot remove stays, so each run finds it again: its name starts
 * with "Flow Check", and each fixed value of it (a phone, an address, a
 * number) is here. One file holds them, so two flows never give one value
 * to two people. A new fixed value takes the next free one.
 */
export const FLOW_CHECK_PHONES = {
  // One row per person, with the name of the person:
  // /** "Flow Check Buyer". */
  // buyer: "+15550100",
} as const;
