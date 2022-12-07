import { ZooTools_Command } from "./types";

export default function weightedRandom(items: ZooTools_Command[]) {
    items = items.map(i => {
      if(!i?.weight) i.weight = 1;
      return i;
    }).sort((a, b) => b.weight! - a.weight!);
    const weights = items.map(i => i.weight!);
    const cumulative: number[] = [];
    for (let i = 0; i < weights.length; i++) {
      cumulative[i] = weights[i] + (cumulative[i - 1] || 0);
    }
    const totalWeight = cumulative[cumulative.length - 1];
    const rand = totalWeight * Math.random();
    for (let i = 0; i < items.length; i++) {
      if (cumulative[i] >= rand) {
        return items[i];
      }
    }
    return items[0]
  }