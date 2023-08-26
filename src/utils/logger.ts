import { ILogger, LogLevel } from "@sapphire/framework";
import * as process from "process";

/**
 * Plain logger to redirect all content to {@link console.log}.
 * The original logger (using fancy console methods) doesn't seem to like dockerized node.
 */
export class PlainLogger implements ILogger {
    public level: LogLevel;

    public constructor(level: LogLevel) {
        this.level = level;
    }

    has(level: LogLevel): boolean {
        return level >= this.level;
    }

    public trace(...values: readonly unknown[]): void {
        if (this.level > LogLevel.Trace) return;
        this.write(LogLevel.Trace, ...values);
    }

    public debug(...values: readonly unknown[]): void {
        if (this.level > LogLevel.Debug) return;
        this.write(LogLevel.Debug, ...values);
    }

    public info(...values: readonly unknown[]): void {
        if (this.level > LogLevel.Info) return;
        this.write(LogLevel.Info, ...values);
    }

    public warn(...values: readonly unknown[]): void {
        if (this.level > LogLevel.Warn) return;
        this.write(LogLevel.Warn, ...values);
    }

    public error(...values: readonly unknown[]): void {
        if (this.level > LogLevel.Error) return;
        this.write(LogLevel.Error, ...values);
    }

    public fatal(...values: readonly unknown[]): void {
        if (this.level > LogLevel.Fatal) return;
        this.write(LogLevel.Fatal, ...values);
        process.exit(1);
    }

    public write(level: LogLevel, ...values: readonly unknown[]): void {
        console.log(`[${LogLevel[level].toUpperCase()}]`, ...values);
    }
}
