import {Investment} from '../../db';
import {BuyStrategy} from './abstract';
import {BinanceTrader} from '../../trader';

export class DummyBuyStrategy extends BuyStrategy {
    constructor(trader: BinanceTrader) {
        super(trader);
    }

    async shouldBuy(): Promise<Investment | null> {
        const balance =
            this.trader.getWallet()[this.trader.getTargetCurrency()];

        const now = await this.trader.getAPIClient().time();
        const prices = await this.trader.getAPIClient().prices();

        const price = prices[`BTC${this.trader.getTargetCurrency()}`];

        return Promise.resolve({
            id: undefined,
            symbol: 'BTC',
            amount: (balance.available / price) * 0.5,
            rate: price,
            timestamp: now,
        });
    }
}
