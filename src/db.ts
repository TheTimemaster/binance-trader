import {Column, Db, Primary, SQLite3Driver} from 'sqlite-ts';
import SQLite3 from 'sqlite3';

SQLite3.verbose();

export class Investment {
    @Primary()
    id = 0;

    @Column('NVARCHAR')
    symbol = '';

    @Column('DECIMAL')
    amount = 0;

    @Column('DECIMAL')
    rate = 0;

    @Column('INTEGER')
    timestamp = 0;
}

const entities = {
    Investment,
};

export class Persistence {
    dbConn;
    db: Db<{Investment: any}>;

    constructor() {
        this.dbConn = new SQLite3.Database('sqlite.db');
    }

    async init(): Promise<void> {
        this.db = await Db.init({
            driver: new SQLite3Driver(this.dbConn),
            entities,
            createTables: false,
        });
        await this.db.createAllTables();
    }

    async currentInvestments(): Promise<Investment[]> {
        return this.db.tables.Investment.select();
    }

    async addInvestment(investment: Partial<Investment>): Promise<void> {
        await this.db.tables.Investment.insert(investment);
    }

    async endInvestment(investment: Investment): Promise<void> {
        await this.db.tables.Investment.delete().where((c) =>
            c.equals({id: investment.id}),
        );
    }
}
