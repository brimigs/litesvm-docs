import { describe, test, expect } from 'bun:test';
import { createClient } from '@solana/kit-client-litesvm';
import { address, generateKeyPairSigner, lamports } from '@solana/kit';

describe('Account Setup', () => {
    test('basic account setup with rent exemption', async () => {
        const client = await createClient();
        const testAccount = await generateKeyPairSigner();

        const dataSize = 100n;
        const minBalance = client.svm.minimumBalanceForRentExemption(dataSize);
        expect(minBalance).toBeGreaterThan(0n);

        const programId = address('11111111111111111111111111111111');
        const accountData = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

        client.svm.setAccount({
            address: testAccount.address,
            data: accountData,
            executable: false,
            lamports: lamports(minBalance),
            programAddress: programId,
            space: BigInt(accountData.length),
        });

        // Verify via getAccount
        const retrieved = client.svm.getAccount(testAccount.address);
        expect(retrieved.exists).toBe(true);
        if (retrieved.exists) {
            expect(retrieved.lamports).toBe(lamports(minBalance));
            expect(retrieved.programAddress).toBe(programId);
            expect(retrieved.executable).toBe(false);
            expect(Array.from(retrieved.data)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        }

        // Verify via getBalance
        const balance = client.svm.getBalance(testAccount.address);
        expect(balance).toBe(lamports(minBalance));
    });

    test('set up multiple accounts and verify via RPC', async () => {
        const client = await createClient();
        const programId = address('11111111111111111111111111111111');

        const accounts = await Promise.all(
            Array.from({ length: 5 }, () => generateKeyPairSigner())
        );
        const addresses = accounts.map(a => a.address);

        for (const [index, account] of accounts.entries()) {
            const customData = new Uint8Array([index, index + 1, index + 2]);

            client.svm.setAccount({
                address: account.address,
                data: customData,
                executable: false,
                lamports: lamports(1_000_000n),
                programAddress: programId,
                space: BigInt(customData.length),
            });
        }

        // Verify all accounts via RPC getMultipleAccounts
        const { value: rpcAccounts } = await client.rpc
            .getMultipleAccounts(addresses)
            .send();

        expect(rpcAccounts.length).toBe(5);
        rpcAccounts.forEach((acc, i) => {
            expect(acc).not.toBeNull();
            if (acc) {
                expect(acc.lamports).toBe(1_000_000n);
            }
        });
    });

    test('program-owned data account with serialized state', async () => {
        const client = await createClient();
        const programId = (await generateKeyPairSigner()).address;
        const dataAccount = await generateKeyPairSigner();

        // Layout: [u8 discriminator, u64 counter, pubkey placeholder (32 bytes)]
        const data = new Uint8Array(1 + 8 + 32);
        const view = new DataView(data.buffer);

        data[0] = 0x01; // discriminator
        view.setBigUint64(1, 100n, true); // counter

        const minBalance = client.svm.minimumBalanceForRentExemption(BigInt(data.length));

        client.svm.setAccount({
            address: dataAccount.address,
            data,
            executable: false,
            lamports: lamports(minBalance),
            programAddress: programId,
            space: BigInt(data.length),
        });

        // Verify
        const retrieved = client.svm.getAccount(dataAccount.address);
        expect(retrieved.exists).toBe(true);
        if (retrieved.exists) {
            expect(retrieved.data[0]).toBe(0x01);
            const retrievedView = new DataView(retrieved.data.buffer, retrieved.data.byteOffset);
            expect(retrievedView.getBigUint64(1, true)).toBe(100n);
            expect(retrieved.programAddress).toBe(programId);
        }
    });
});
