export type Wallet = {
    [symbol: string]: {
        available: number;
        onOrder: number;
    };
};

export type Candlestick = {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    closeTime: number;
    assetVolume: number;
    trades: number;
    buyBaseVolume: number;
    buyAssetVolume: number;
    ignored: number;
};

export enum CandlestickInterval {
    I1m = '1m',
    I3m = '3m',
    I5m = '5m',
    I15m = '15m',
    I30m = '30m',
    I1h = '1h',
    I2h = '2h',
    I4h = '4h',
    I6h = '6h',
    I8h = '8h',
    I12h = '12h',
    I1d = '1d',
    I3d = '3d',
    I1w = '1w',
    I1M = '1M',
}

export class TypedAPI {
    client: any;

    constructor(client: any) {
        this.client = client;
    }

    async balance(): Promise<Wallet> {
        return Object.fromEntries(
            Object.entries(await this.client.balance()).map(([k, v]) => [
                k,
                {
                    available: Number.parseFloat((v as any).available),
                    onOrder: Number.parseFloat((v as any).onOrder),
                },
            ]),
        );
    }

    async time(): Promise<number> {
        return (await this.client.time()).serverTime as number;
    }

    async prices(): Promise<{[ticker: string]: number}> {
        return await this.client.prices();
    }

    async marketBuy(ticker: string, quantity: number): Promise<void> {
        await this.client.marketBuy(ticker, quantity);
    }

    async marketSell(ticker: string, quantity: number): Promise<void> {
        await this.client.marketSell(ticker, quantity);
    }

    async candlesticks(
        ticker: string,
        interval: CandlestickInterval,
        amount: number,
    ): Promise<Candlestick[]> {
        return new Promise((resolve, reject) => {
            this.client.candlesticks(
                ticker,
                interval,
                (error, ticks: any[], symbol) => {
                    if (error) {
                        reject(error);
                        return;
                    }
                    resolve(
                        ticks.map((t) => {
                            t = t.map(Number.parseFloat);
                            const [
                                time,
                                open,
                                high,
                                low,
                                close,
                                volume,
                                closeTime,
                                assetVolume,
                                trades,
                                buyBaseVolume,
                                buyAssetVolume,
                                ignored,
                            ] = t;
                            return {
                                time,
                                open,
                                high,
                                low,
                                close,
                                volume,
                                closeTime,
                                assetVolume,
                                trades,
                                buyBaseVolume,
                                buyAssetVolume,
                                ignored,
                            };
                        }),
                    );
                },
                {limit: amount},
            );
        });
    }
}
