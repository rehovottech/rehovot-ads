export class Logger {
  private debugEnabled = false;

  public constructor(private readonly scope: string) {}

  public configure(debugEnabled: boolean): void {
    this.debugEnabled = debugEnabled;
  }

  public info(message: string, details?: unknown): void {
    if (!this.debugEnabled) {
      return;
    }

    if (details === undefined) {
      console.log(`[${this.scope}] ${message}`);
      return;
    }

    console.log(`[${this.scope}] ${message}`, details);
  }

  public warn(message: string, details?: unknown): void {
    if (!this.debugEnabled) {
      return;
    }

    if (details === undefined) {
      console.warn(`[${this.scope}] ${message}`);
      return;
    }

    console.warn(`[${this.scope}] ${message}`, details);
  }

  public error(message: string, details?: unknown): void {
    if (details === undefined) {
      console.error(`[${this.scope}] ${message}`);
      return;
    }

    console.error(`[${this.scope}] ${message}`, details);
  }
}
