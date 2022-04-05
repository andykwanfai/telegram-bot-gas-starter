import { Utils } from '../src/Utils';

describe("parseJson", () => {
  it('should return an object', async () => {
    const result = Utils.parseJson(`{"abc":"cde","efg":123}`);
    expect(result).toStrictEqual({ abc: "cde", efg: 123 });
  });

  it('should return a string', async () => {
    const result = Utils.parseJson("this is a string");
    expect(result).toBe('this is a string');
  });
});
