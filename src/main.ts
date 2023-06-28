import { cleanOrders } from './modules/clean-orders';
import { mergeOrders } from './modules/merge-orders';
import { TWAPManager } from './modules/twap';
import { DURATION, TWAP } from './utils/config';
import { exchange } from './utils/exchange';

const cleanAndMerge = async () => {
  if (exchange.store.orders.length > 0) {
    await cleanOrders();
    await mergeOrders();
  }
};

const main = async () => {
  await exchange.start();
  await cleanAndMerge();

  const twaps = TWAP.map(
    ({ symbol, sizeInUSD, side }) =>
      new TWAPManager(symbol, sizeInUSD, DURATION, side)
  );

  // eslint-disable-next-line no-console
  console.log(`\nStarted ${twaps.length} TWAPs\n`);
};

main();
