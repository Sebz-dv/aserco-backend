"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const auth_validator_1 = require("./auth.validator");
(0, vitest_1.describe)('auth validators', () => {
    (0, vitest_1.it)('accepts a valid registration payload', () => {
        const payload = {
            name: 'Ana García',
            email: 'ana@aserco.com',
            password: 'Abcdef123',
        };
        (0, vitest_1.expect)(auth_validator_1.registerSchema.parse(payload)).toMatchObject(payload);
    });
    (0, vitest_1.it)('rejects weak passwords', () => {
        (0, vitest_1.expect)(() => auth_validator_1.registerSchema.parse({
            name: 'Ana García',
            email: 'ana@aserco.com',
            password: '123',
        })).toThrow();
    });
    (0, vitest_1.it)('accepts a valid login payload', () => {
        (0, vitest_1.expect)(auth_validator_1.loginSchema.parse({
            email: 'ana@aserco.com',
            password: 'Abcdef123',
        })).toMatchObject({
            email: 'ana@aserco.com',
            password: 'Abcdef123',
        });
    });
});
