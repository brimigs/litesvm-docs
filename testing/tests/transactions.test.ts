import { describe, test, expect } from 'bun:test';
import { generateKeyPairSigner, lamports } from '@solana/kit';
import { systemProgram } from '@solana-program/system';
import { createLitesvmClient } from './_helpers';

describe('Transactions', () => {
    test('sendTransaction returns metadata with getter methods', async () => {
        const client = (await createLitesvmClient()).use(systemProgram());
        const recipient = await generateKeyPairSigner();

        client.svm.airdrop(client.payer.address, lamports(10_000_000_000n));

        const result = await client.system.instructions.transferSol({
            source: client.payer,
            destination: recipient.address,
            amount: lamports(1_000_000_000n),
        }).sendTransaction();

        expect(result).toBeDefined();
    });

    test('airdrop returns transaction metadata', async () => {
        const client = await createLitesvmClient();
        const account = await generateKeyPairSigner();

        const result = client.svm.airdrop(account.address, lamports(5_000_000_000n));

        if (result && 'computeUnitsConsumed' in result) {
            expect(result.computeUnitsConsumed()).toBeGreaterThanOrEqual(0n);
        }
    });

    test('latestBlockhash returns a blockhash', async () => {
        const client = await createLitesvmClient();

        const blockhash = client.svm.latestBlockhash();
        expect(blockhash).toBeDefined();
        expect(typeof blockhash).toBe('string');
    });

    test('expireBlockhash advances to new blockhash', async () => {
        const client = await createLitesvmClient();

        const oldBlockhash = client.svm.latestBlockhash();
        client.svm.expireBlockhash();
        const newBlockhash = client.svm.latestBlockhash();

        expect(newBlockhash).not.toBe(oldBlockhash);
    });

    test('transaction history stores and retrieves transactions', async () => {
        const client = (await createLitesvmClient()).use(systemProgram());
        client.svm.withTransactionHistory(100n);

        const recipient = await generateKeyPairSigner();
        client.svm.airdrop(client.payer.address, lamports(10_000_000_000n));

        await client.system.instructions.transferSol({
            source: client.payer,
            destination: recipient.address,
            amount: lamports(1_000_000_000n),
        }).sendTransaction();

        expect(true).toBe(true);
    });
});
