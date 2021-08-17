import {BinanceTrader} from './trader';

const run = async () => {
    const trader = new BinanceTrader('USDT');
    await trader.init();
    await trader.run();
};

run();
