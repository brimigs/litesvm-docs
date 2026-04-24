import { describe, test, expect } from 'bun:test';
import { generateKeyPairSigner, lamports } from '@solana/kit';
import { createLitesvmClient } from './_helpers';

describe('Configuration', () => {
    test('withSigverify enables and disables', async () => {
        const client = await createLitesvmClient();
        client.svm.withSigverify(false);
        client.svm.withSigverify(true);
    });

    test('withBlockhashCheck enables and disables', async () => {
        const client = await createLitesvmClient();
        client.svm.withBlockhashCheck(false);
        client.svm.withBlockhashCheck(true);
    });

    test('withSysvars enables sysvar access', async () => {
        const client = await createLitesvmClient();
        client.svm.withSysvars();

        const clock = client.svm.getClock();
        expect(clock.slot).toBeDefined();

        const rent = client.svm.getRent();
        expect(rent.lamportsPerByteYear).toBeGreaterThan(0n);
    });

    test('withBuiltins does not throw', async () => {
        const client = await createLitesvmClient();
        client.svm.withBuiltins();
    });

    test('withPrecompiles does not throw', async () => {
        const client = await createLitesvmClient();
        client.svm.withPrecompiles();
    });

    test('withDefaultPrograms does not throw', async () => {
        const client = await createLitesvmClient();
        client.svm.withDefaultPrograms();
    });

    test('withLamports sets default lamports', async () => {
        const client = await createLitesvmClient();
        client.svm.withLamports(1_000_000_000n);
    });

    test('withLogBytesLimit sets limit', async () => {
        const client = await createLitesvmClient();
        client.svm.withLogBytesLimit(10000n);
    });

    test('withTransactionHistory sets capacity', async () => {
        const client = await createLitesvmClient();
        client.svm.withTransactionHistory(100n);
    });

    test('builder methods chain correctly', async () => {
        const client = await createLitesvmClient();

        const result = client.svm
            .withSigverify(false)
            .withBlockhashCheck(false)
            .withSysvars()
            .withBuiltins()
            .withTransactionHistory(100n);

        expect(result).toBe(client.svm);
    });

    test('airdrop while configuring builder', async () => {
        const client = await createLitesvmClient();
        const account = await generateKeyPairSigner();

        client.svm.withSysvars().withTransactionHistory(100n);
        client.svm.airdrop(account.address, lamports(5_000_000_000n));

        const balance = client.svm.getBalance(account.address);
        expect(balance).toBe(lamports(5_000_000_000n));
    });
});
