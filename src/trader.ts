import Binance from 'node-binance-api';
import {BinanceCredentials} from './credentials';
import {TypedAPI, Wallet} from './ts-api';
import {Persistence} from './db';
import {SellStrategy} from './strategies/sell/abstract';
import {BuyStrategy} from './strategies/buy/abstract';
import {TriangleSellStrategy} from './strategies/sell/triangle';
import {MovingAverageGoUp} from './strategies/buy/movingAverageGoUp';

export class BinanceTrader {
    private sellStrategy: SellStrategy;
    private buyStrategy: BuyStrategy;
    private readonly apiClient: TypedAPI;
    private wallet: Wallet;
    private readonly persistence: Persistence;
    private readonly targetCurrency: string;

    public getWallet(): Wallet {
        return this.wallet;
    }

    public getPersistence(): Persistence {
        return this.persistence;
    }

    public getTargetCurrency(): string {
        return this.targetCurrency;
    }

    public getAPIClient(): TypedAPI {
        return this.apiClient;
    }

    constructor(targetCurrency: string) {
        this.targetCurrency = targetCurrency;
        this.persistence = new Persistence();
        this.apiClient = new TypedAPI(new Binance(BinanceCredentials));
        this.buyStrategy = new MovingAverageGoUp(this);
        this.sellStrategy = new TriangleSellStrategy(
            this,
            0.03,
            0.1,
            60 * 60 * 2,
        );
    }

    public async init(): Promise<void> {
        await this.refreshWallet();
        await this.persistence.init();
    }

    private async refreshWallet() {
        this.wallet = await this.apiClient.balance();
    }

    private async sellStep() {
        console.log('Running Sell');
        const investments = await this.persistence.currentInvestments();
        for (const investment of investments) {
            if (await this.sellStrategy.shouldSell(investment)) {
                console.log(`Will sell: ${JSON.stringify(investment)}`);
                try {
                    await this.apiClient.marketSell(
                        `${investment.symbol}${this.targetCurrency}`,
                        investment.amount,
                    );
                    await this.persistence.endInvestment(investment);
                } catch (e) {
                    console.log('Error while selling:');
                    console.log(e);
                    console.log(JSON.stringify(e));
                }
            }
        }
    }

    private async buyStep() {
        console.log('Running Buy');
        await this.refreshWallet();
        const newInvestment = await this.buyStrategy.shouldBuy();
        if (newInvestment != null) {
            console.log(`Will buy: ${JSON.stringify(newInvestment)}`);
            try {
                await this.apiClient.marketBuy(
                    `${newInvestment.symbol}${this.targetCurrency}`,
                    newInvestment.amount,
                );
                await this.persistence.addInvestment(newInvestment);
            } catch (e) {
                console.log('Error while buying:');
                console.log(e);
                console.log(JSON.stringify(e));
            }
        }
    }

    async run(): Promise<void> {
        console.log('------------------');
        console.log(
            `Start new iteration, current time: ${Date()}, Binance timestamp: ${await this.getAPIClient().time()}`,
        );
        await this.buyStep();
        await this.sellStep();
        console.log('Done.');
    }
}
