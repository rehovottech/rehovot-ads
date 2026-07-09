// Lightweight logger that can be silenced with a debug flag.
export class Logger {
  public constructor(private readonly debugEnabled: boolean) {}

  // Logs only when debug mode is enabled.
  public log(message: string, ...details: readonly unknown[]): void {
    if (!this.debugEnabled) {
      return;
    }

    console.log(message, ...details);
  }
}
