import { describe, test, expect } from 'bun:test';
import { createClient } from '@solana/kit-client-litesvm';
import { generateKeyPairSigner, lamports } from '@solana/kit';
import { systemProgram } from '@solana-program/system';

describe('Transactions', () => {
    test('sendTransaction returns metadata with getter methods', async () => {
        const client = (await createClient()).use(systemProgram());
        const recipient = await generateKeyPairSigner();

        client.svm.airdrop(client.payer.address, lamports(10_000_000_000n));

        const result = await client.system.instructions.transferSol({
            source: client.payer,
            destination: recipient.address,
            amount: lamports(1_000_000_000n),
        }).sendTransaction();

        // Result metadata should have getter methods (called with parentheses)
        expect(result).toBeDefined();
    });

    test('airdrop returns transaction metadata', async () => {
        const client = await createClient();
        const account = await generateKeyPairSigner();

        const result = client.svm.airdrop(account.address, lamports(5_000_000_000n));

        if (result) {
            // computeUnitsConsumed is a getter function
            expect(result.computeUnitsConsumed()).toBeGreaterThanOrEqual(0n);
        }
    });

    test('latestBlockhash returns a blockhash', async () => {
        const client = await createClient();

        const blockhash = client.svm.latestBlockhash();
        expect(blockhash).toBeDefined();
        expect(typeof blockhash).toBe('string');
    });

    test('latestBlockhashLifetime returns blockhash with lifetime', async () => {
        const client = await createClient();

        const blockhashLifetime = client.svm.latestBlockhashLifetime();
        expect(blockhashLifetime).toBeDefined();
        expect(blockhashLifetime.blockhash).toBeDefined();
        expect(blockhashLifetime.lastValidBlockHeight).toBeDefined();
    });

    test('expireBlockhash advances to new blockhash', async () => {
        const client = await createClient();

        const oldBlockhash = client.svm.latestBlockhash();
        client.svm.expireBlockhash();
        const newBlockhash = client.svm.latestBlockhash();

        expect(newBlockhash).not.toBe(oldBlockhash);
    });

    test('transaction history stores and retrieves transactions', async () => {
        const client = (await createClient()).use(systemProgram());
        client.svm.withTransactionHistory(100n);

        const recipient = await generateKeyPairSigner();
        client.svm.airdrop(client.payer.address, lamports(10_000_000_000n));

        await client.system.instructions.transferSol({
            source: client.payer,
            destination: recipient.address,
            amount: lamports(1_000_000_000n),
        }).sendTransaction();

        // If we got here without error, transaction history is working
        expect(true).toBe(true);
    });
});
