import {Investment} from '../../db';
import {BinanceTrader} from '../../trader';

export abstract class BuyStrategy {
    trader: BinanceTrader;

    protected constructor(trader: BinanceTrader) {
        this.trader = trader;
    }

    abstract shouldBuy(): Promise<Investment | null>;
}
