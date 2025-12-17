export interface Cache {
  read(key: string): Promise<unknown>;
  write(key: string, value: unknown): Promise<void>;
  fetch<T>(key: string, block?: () => T | Promise<T>): Promise<T | null>;
  getCacheDir(): string;
}

export class NullCache implements Cache {
  async read(_key: string): Promise<unknown> {
    return null;
  }

  async write(_key: string, _value: unknown): Promise<void> {
  }

  async fetch<T>(_key: string, block?: () => T | Promise<T>): Promise<T | null> {
    if (!block) {
      return null;
    }
    return block();
  }

  getCacheDir(): string {
    return '';
  }
}
