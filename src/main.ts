import { TWAPManager } from './modules/twap';
import { DURATION, TWAP } from './utils/config';
import { exchange } from './utils/exchange';
import { sleep } from './utils/sleep';

const main = async () => {
  await exchange.start();

  const twaps = [];
  for (const { symbol, sizeInUSD, side } of TWAP) {
    twaps.push(new TWAPManager(symbol, sizeInUSD, DURATION, side));
    await sleep(1000);
  }

  // eslint-disable-next-line no-console
  console.log(`\nStarted ${TWAP.length} TWAPs\n`);
};

main();
