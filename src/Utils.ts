
export class Utils {
  static parseJson(s: string): string | object {
    try {
      return JSON.parse(s);
    } catch (error) {
      return s;
    }
  }

  static sleep(sec: number) {
    Utilities.sleep(sec * 1000);
  }
}