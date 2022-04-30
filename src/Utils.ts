
export class Utils {
  static parseJson(s: string): null | object {
    try {
      return JSON.parse(s);
    } catch (error) {
      return null;
    }
  }

  static sleep(sec: number) {
    Utilities.sleep(sec * 1000);
  }

  static now() {
    return new Date().getTime();
  }
}