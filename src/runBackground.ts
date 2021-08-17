import {BinanceTrader} from './trader';

const run = async () => {
    const trader = new BinanceTrader('USDT');
    await trader.init();
    setInterval(async () => {
        await trader.run();
    }, 20 * 1000);
};

run();
