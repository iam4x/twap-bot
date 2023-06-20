import { mergeOrders } from './modules/merge-orders';
import { TWAPManager } from './modules/twap';
import { DURATION, TWAP } from './utils/config';
import { exchange } from './utils/exchange';

async function main() {
  await exchange.start();
  await mergeOrders();

  const twaps = TWAP.map(
    ({ symbol, sizeInUSD, side }) =>
      new TWAPManager(symbol, sizeInUSD, DURATION, side)
  );

  // eslint-disable-next-line no-console
  console.log(`\nStarted ${twaps.length} TWAPs\n`);
}

main();
