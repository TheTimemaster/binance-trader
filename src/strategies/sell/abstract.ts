import {Investment} from '../../db';
import {BinanceTrader} from '../../index';

export abstract class SellStrategy {
    trader: BinanceTrader;

    protected constructor(trader: BinanceTrader) {
        this.trader = trader;
    }

    abstract shouldSell(investment: Investment): Promise<boolean>;
}
