import { describe, test, expect } from 'bun:test';
import { createClient } from '@solana/kit-client-litesvm';
import { generateKeyPairSigner, lamports } from '@solana/kit';

describe('Configuration', () => {
    test('withSigverify enables and disables', async () => {
        const client = await createClient();
        // Should not throw
        client.svm.withSigverify(false);
        client.svm.withSigverify(true);
    });

    test('withBlockhashCheck enables and disables', async () => {
        const client = await createClient();
        client.svm.withBlockhashCheck(false);
        client.svm.withBlockhashCheck(true);
    });

    test('withSysvars enables sysvar access', async () => {
        const client = await createClient();
        client.svm.withSysvars();

        const clock = client.svm.getClock();
        expect(clock.slot).toBeDefined();

        const rent = client.svm.getRent();
        expect(rent.lamportsPerByteYear).toBeGreaterThan(0n);
    });

    test('withBuiltins does not throw', async () => {
        const client = await createClient();
        client.svm.withBuiltins();
    });

    test('withPrecompiles does not throw', async () => {
        const client = await createClient();
        client.svm.withPrecompiles();
    });

    test('withDefaultPrograms does not throw', async () => {
        const client = await createClient();
        client.svm.withDefaultPrograms();
    });

    test('withLamports sets default lamports', async () => {
        const client = await createClient();
        client.svm.withLamports(1_000_000_000n);
    });

    test('withLogBytesLimit sets limit', async () => {
        const client = await createClient();
        client.svm.withLogBytesLimit(10000n);
    });

    test('withTransactionHistory sets capacity', async () => {
        const client = await createClient();
        client.svm.withTransactionHistory(100n);
    });

    test('builder methods chain correctly', async () => {
        const client = await createClient();

        // All methods should return LiteSVM for chaining
        const result = client.svm
            .withSigverify(false)
            .withBlockhashCheck(false)
            .withSysvars()
            .withBuiltins()
            .withTransactionHistory(100n);

        // Verify chaining returned the svm instance
        expect(result).toBe(client.svm);
    });

    test('tap executes inline function while chaining', async () => {
        const client = await createClient();
        const account = await generateKeyPairSigner();
        let tapCalled = false;

        client.svm
            .withSysvars()
            .tap(svm => {
                svm.airdrop(account.address, lamports(5_000_000_000n));
                tapCalled = true;
            })
            .withTransactionHistory(100n);

        expect(tapCalled).toBe(true);
        const balance = client.svm.getBalance(account.address);
        expect(balance).toBe(lamports(5_000_000_000n));
    });
});
