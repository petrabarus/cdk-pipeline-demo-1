/**
 * @jest-environment node
 */
import { handler } from "../src/handler";

test('should return correct', async () => {
    const actual = await handler({}, {});
    expect(actual.statusCode).toEqual(200);
});