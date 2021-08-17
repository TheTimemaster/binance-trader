import {SellStrategy} from './abstract';
import {Investment} from '../../db';
import {BinanceTrader} from '../../trader';

export class AfterTimeSellStrategy extends SellStrategy {
    sellInterval: number;

    constructor(trader: BinanceTrader, seconds: number) {
        super(trader);
        this.sellInterval = seconds * 1000;
    }

    async shouldSell(investment: Investment): Promise<boolean> {
        const now = await this.trader.getAPIClient().time();
        return Promise.resolve(now - investment.timestamp > this.sellInterval);
    }
}
