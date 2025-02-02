import type { MongoClient } from "mongodb";

export {};

declare global {
  namespace NodeJS {
    interface Global {
      _mongo: Promise<MongoClient>;
    }
  }

  interface Window {
    google: any;
  }
}
