import {Investment} from '../../db';
import {BuyStrategy} from './abstract';
import {BinanceTrader} from '../../index';
import {CandlestickInterval} from '../../ts-api';
import {decreasing, differences, increasing, movingAverage} from '../../math';

const symbols = ['BTC', 'BNB', 'ETH', 'XRP', 'DOGE'];

export class MovingAverageGoUp extends BuyStrategy {
    constructor(trader: BinanceTrader) {
        super(trader);
    }

    async shouldBuy(): Promise<Investment | null> {
        const balance =
            this.trader.getWallet()[this.trader.getTargetCurrency()];

        const now = await this.trader.getAPIClient().time();
        const prices = await this.trader.getAPIClient().prices();

        for (const symbol of symbols) {
            console.log('---');
            console.log(`Checking if ${symbol} is viable...`);

            const candles = await this.trader
                .getAPIClient()
                .candlesticks(
                    `${symbol}${this.trader.getTargetCurrency()}`,
                    CandlestickInterval.I1m,
                    80,
                );

            const avgPrices = candles.map((c) => (c.high + c.low) / 2);
            const longMa = movingAverage(avgPrices, 60);
            const shortMa = movingAverage(avgPrices, 15);

            console.log(`d 15min MA: ${differences(shortMa.slice(-10, -1))}`);
            console.log(`d 60min MA: ${differences(longMa.slice(-10, -1))}`);

            if (
                increasing(shortMa.slice(-10, -1)) &&
                increasing(longMa.slice(-4, -1)) &&
                decreasing(longMa.slice(-10, -7))
            ) {
                console.log(`${symbol} deemed viable to buy.`);
                const price =
                    prices[`${symbol}${this.trader.getTargetCurrency()}`];

                return Promise.resolve({
                    id: undefined,
                    symbol: symbol,
                    amount: (balance.available / price) * 0.2,
                    rate: price,
                    timestamp: now,
                });
            }
        }

        console.log('No asset deemed viable to buy now.');

        return null;
    }
}
