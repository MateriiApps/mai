import { promisify } from "node:util";

export const sleep = promisify(setTimeout);

export const numberWithCommas = (value: number): string => value.toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
