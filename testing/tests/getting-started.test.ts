import { describe, test, expect } from 'bun:test';
import { createClient } from '@solana/kit-client-litesvm';
import { generateKeyPairSigner, address, lamports } from '@solana/kit';

describe('Getting Started', () => {
    test('createClient returns funded payer', async () => {
        const client = await createClient();
        expect(client.payer).toBeDefined();
        expect(client.svm).toBeDefined();
        expect(client.rpc).toBeDefined();
    });

    test('createClient with custom payer', async () => {
        const customPayer = await generateKeyPairSigner();
        const client = await createClient({ payer: customPayer });
        expect(client.payer.address).toBe(customPayer.address);
    });

    test('airdrop and getBalance', async () => {
        const client = await createClient();

        client.svm.airdrop(client.payer.address, lamports(5_000_000_000n));
        const balance = client.svm.getBalance(client.payer.address);
        expect(balance).toBeGreaterThan(0n);
    });

    test('setAccount then read via rpc.getAccountInfo', async () => {
        const client = await createClient();
        const myAddress = (await generateKeyPairSigner()).address;

        client.svm.setAccount({
            address: myAddress,
            data: new Uint8Array([0xde, 0xad, 0xbe, 0xef]),
            executable: false,
            lamports: lamports(1_000_000n),
            programAddress: address('11111111111111111111111111111111'),
            space: 4n,
        });

        // Read via RPC (returns base64-encoded data)
        const { value } = await client.rpc.getAccountInfo(myAddress).send();
        expect(value).not.toBeNull();
        if (value) {
            expect(value.lamports).toBe(1_000_000n);
            // data is returned as [base64string, 'base64']
            expect(value.data[1]).toBe('base64');
        }
    });

    test('rpc.getMultipleAccounts', async () => {
        const client = await createClient();
        const accounts = await Promise.all(
            Array.from({ length: 3 }, () => generateKeyPairSigner())
        );

        for (const acc of accounts) {
            client.svm.setAccount({
                address: acc.address,
                data: new Uint8Array([1]),
                executable: false,
                lamports: lamports(1_000_000n),
                programAddress: address('11111111111111111111111111111111'),
                space: 1n,
            });
        }

        const { value } = await client.rpc
            .getMultipleAccounts(accounts.map(a => a.address))
            .send();

        expect(value.length).toBe(3);
        value.forEach(acc => {
            expect(acc).not.toBeNull();
        });
    });

    test('rpc.getLatestBlockhash', async () => {
        const client = await createClient();
        const { value } = await client.rpc.getLatestBlockhash().send();
        expect(value.blockhash).toBeDefined();
        expect(value.lastValidBlockHeight).toBeDefined();
    });

    test('latestBlockhashLifetime for manual transaction building', async () => {
        const client = await createClient();
        const blockhashLifetime = client.svm.latestBlockhashLifetime();
        expect(blockhashLifetime.blockhash).toBeDefined();
        expect(blockhashLifetime.lastValidBlockHeight).toBeDefined();
    });
});
