import {SellStrategy} from './abstract';
import {Investment} from '../../db';
import {BinanceTrader} from '../../trader';

export class TriangleSellStrategy extends SellStrategy {
    sellOver: number;
    up: number;
    down: number;

    constructor(
        trader: BinanceTrader,
        up: number,
        down: number,
        seconds: number,
    ) {
        super(trader);
        this.sellOver = seconds * 1000;
        this.up = up;
        this.down = down;
    }

    async shouldSell(investment: Investment): Promise<boolean> {
        const now = await this.trader.getAPIClient().time();

        const prices = await this.trader.getAPIClient().prices();
        const price =
            prices[`${investment.symbol}${this.trader.getTargetCurrency()}`];

        const ratio = price / investment.rate;

        const dt = now - investment.timestamp;
        const percentElapsed = dt / this.sellOver;

        if (ratio > 1 + this.up * (1 - percentElapsed)) {
            console.log(
                `Will sell at a profit: ratio=${ratio} (buy=${investment.rate}, sell=${price})`,
            );
            return Promise.resolve(true);
        }

        if (ratio < 1 - this.down * (1 - percentElapsed)) {
            console.log(
                `Will emergency sell at a loss: ratio=${ratio} (buy=${investment.rate}, sell=${price})`,
            );
            return Promise.resolve(true);
        }

        return Promise.resolve(false);
    }
}
