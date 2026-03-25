import { describe, test, expect } from 'bun:test';
import { createClient } from '@solana/kit-client-litesvm';
import { generateKeyPairSigner, lamports } from '@solana/kit';
import { systemProgram } from '@solana-program/system';

describe('SOL Transfer', () => {
    test('create client and check balance', async () => {
        const client = await createClient();

        // Airdrop to payer
        client.svm.airdrop(client.payer.address, lamports(5_000_000_000n));

        const balance = client.svm.getBalance(client.payer.address);
        expect(balance).toBeGreaterThan(0n);
    });

    test('transfer SOL via plugin pattern', async () => {
        const client = (await createClient()).use(systemProgram());
        const recipient = await generateKeyPairSigner();

        // Airdrop to payer
        client.svm.airdrop(client.payer.address, lamports(10_000_000_000n));

        // Build & Send transaction
        await client.system.instructions.transferSol({
            source: client.payer,
            destination: recipient.address,
            amount: lamports(1_000_000_000n),
        }).sendTransaction();

        // Check recipient balance
        const recipientBalance = client.svm.getBalance(recipient.address);
        expect(recipientBalance).toBe(lamports(1_000_000_000n));
    });
});
