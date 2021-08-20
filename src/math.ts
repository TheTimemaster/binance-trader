import _ from 'lodash';

export const reduceWithAcc = <IT, OT, AT>(
    collection: Iterable<IT>,
    f: (acc: AT, el: IT, index: number) => [OT, AT],
    acc: AT,
): OT[] => {
    const arr = [];
    let i = 0;
    for (const el of collection) {
        const [outEl, nextAcc] = f(acc, el, i);
        arr.push(outEl);
        acc = nextAcc;
        i++;
    }
    return arr;
};

export const toFixedDown = (x: number, places: number): number =>
    Math.floor(x * 10 ** places) / 10 ** places;

export const roundify = (x: number): string => {
    const amount = Math.log10(Math.abs(x));
    // if log10 is NaN x should be 0
    if (amount != amount) {
        return '0';
    }
    const places = Math.max(3, Math.floor(-amount) + 2);
    return toFixedDown(x, places).toFixed(places);
};

export const differences = (numbers: number[]) => {
    return reduceWithAcc(numbers, (last, el) => [el - last, el], 0).slice(1);
};

export const increasing = (numbers: number[]) =>
    differences(numbers).every((n) => n >= 0);

export const decreasing = (numbers: number[]) =>
    differences(numbers).every((n) => n <= 0);

export const movingAverage = (numbers: number[], length = 5): number[] => {
    const sum = _.sum(numbers.slice(0, length - 1));
    return reduceWithAcc(
        numbers.slice(length - 1),
        (sum, el, i) => [(sum + el) / length, sum + el - numbers[i]],
        sum,
    );
};
