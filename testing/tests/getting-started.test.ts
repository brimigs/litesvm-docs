import { describe, test, expect } from 'bun:test';
import { createClient, generateKeyPairSigner, address, lamports } from '@solana/kit';
import { litesvm } from '@solana/kit-plugin-litesvm';
import { signer } from '@solana/kit-plugin-signer';
import { createLitesvmClient } from './_helpers';

describe('Getting Started', () => {
    test('client has payer, svm, rpc', async () => {
        const client = await createLitesvmClient();
        expect(client.payer).toBeDefined();
        expect(client.svm).toBeDefined();
        expect(client.rpc).toBeDefined();
    });

    test('createClient with explicit payer', async () => {
        const mySigner = await generateKeyPairSigner();
        const client = createClient().use(signer(mySigner)).use(litesvm());
        expect(client.payer.address).toBe(mySigner.address);
    });

    test('airdrop and getBalance', async () => {
        const client = await createLitesvmClient();

        client.svm.airdrop(client.payer.address, lamports(5_000_000_000n));
        const balance = client.svm.getBalance(client.payer.address);
        expect(balance).toBeGreaterThan(0n);
    });

    test('setAccount then read via rpc.getAccountInfo', async () => {
        const client = await createLitesvmClient();
        const myAddress = (await generateKeyPairSigner()).address;

        client.svm.setAccount({
            address: myAddress,
            data: new Uint8Array([0xde, 0xad, 0xbe, 0xef]),
            executable: false,
            lamports: lamports(1_000_000n),
            programAddress: address('11111111111111111111111111111111'),
            space: 4n,
        });

        const { value } = await client.rpc.getAccountInfo(myAddress).send();
        expect(value).not.toBeNull();
        if (value) {
            expect(value.lamports).toBe(lamports(1_000_000n));
            expect(value.data[1]).toBe('base64');
        }
    });

    test('rpc.getMultipleAccounts', async () => {
        const client = await createLitesvmClient();
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
        const client = await createLitesvmClient();
        const { value } = await client.rpc.getLatestBlockhash().send();
        expect(value.blockhash).toBeDefined();
        expect(value.lastValidBlockHeight).toBeDefined();
    });

    test('latestBlockhash via client.svm', async () => {
        const client = await createLitesvmClient();
        const blockhash = client.svm.latestBlockhash();
        expect(blockhash).toBeDefined();
        expect(typeof blockhash).toBe('string');
    });
});
