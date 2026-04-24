import { describe, test, expect } from 'bun:test';
import { generateKeyPairSigner, lamports } from '@solana/kit';
import { systemProgram } from '@solana-program/system';
import { createLitesvmClient } from './_helpers';

describe('SOL Transfer', () => {
    test('create client and check balance', async () => {
        const client = await createLitesvmClient();

        client.svm.airdrop(client.payer.address, lamports(5_000_000_000n));

        const balance = client.svm.getBalance(client.payer.address);
        expect(balance).toBeGreaterThan(0n);
    });

    test('transfer SOL via plugin pattern', async () => {
        const client = (await createLitesvmClient()).use(systemProgram());
        const recipient = await generateKeyPairSigner();

        client.svm.airdrop(client.payer.address, lamports(10_000_000_000n));

        await client.system.instructions.transferSol({
            source: client.payer,
            destination: recipient.address,
            amount: lamports(1_000_000_000n),
        }).sendTransaction();

        const recipientBalance = client.svm.getBalance(recipient.address);
        expect(recipientBalance).toBe(lamports(1_000_000_000n));
    });
});
