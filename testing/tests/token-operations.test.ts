import { describe, test, expect } from 'bun:test';
import { createClient } from '@solana/kit-client-litesvm';
import { generateKeyPairSigner, lamports } from '@solana/kit';
import { findAssociatedTokenPda, tokenProgram, TOKEN_PROGRAM_ADDRESS } from '@solana-program/token';

describe('Token Operations', () => {
    test('create mint, mint to ATA, transfer, and verify balances', async () => {
        const client = (await createClient()).use(tokenProgram());

        const mintAuthority = await generateKeyPairSigner();
        const newMint = await generateKeyPairSigner();
        const recipient = await generateKeyPairSigner();

        // Create a mint
        await client.token.instructions
            .createMint({
                newMint,
                decimals: 9,
                mintAuthority: mintAuthority.address,
            })
            .sendTransaction();

        // Verify mint account
        const mintAccount = await client.token.accounts.mint.fetch(newMint.address);
        expect(mintAccount.data.decimals).toBe(9);
        expect(mintAccount.data.supply).toBe(0n);

        // Mint tokens to payer's ATA
        await client.token.instructions
            .mintToATA({
                mint: newMint.address,
                owner: client.payer.address,
                mintAuthority,
                amount: 1_000_000_000n,
                decimals: 9,
            })
            .sendTransaction();

        // Derive payer's ATA and verify balance
        const [payerAta] = await findAssociatedTokenPda({
            owner: client.payer.address,
            mint: newMint.address,
            tokenProgram: TOKEN_PROGRAM_ADDRESS,
        });
        const payerTokenAccount = await client.token.accounts.token.fetch(payerAta);
        expect(payerTokenAccount.data.amount).toBe(1_000_000_000n);
        expect(payerTokenAccount.data.mint).toBe(newMint.address);
        expect(payerTokenAccount.data.owner).toBe(client.payer.address);

        // Transfer tokens to recipient's ATA
        await client.token.instructions
            .transferToATA({
                mint: newMint.address,
                authority: client.payer,
                recipient: recipient.address,
                amount: 400_000_000n,
                decimals: 9,
            })
            .sendTransaction();

        // Derive recipient's ATA and verify balance
        const [recipientAta] = await findAssociatedTokenPda({
            owner: recipient.address,
            mint: newMint.address,
            tokenProgram: TOKEN_PROGRAM_ADDRESS,
        });
        const recipientTokenAccount = await client.token.accounts.token.fetch(recipientAta);
        expect(recipientTokenAccount.data.amount).toBe(400_000_000n);
        expect(recipientTokenAccount.data.owner).toBe(recipient.address);

        // Verify payer balance decreased
        const payerAfter = await client.token.accounts.token.fetch(payerAta);
        expect(payerAfter.data.amount).toBe(600_000_000n);

        // Verify mint supply updated
        const mintAfter = await client.token.accounts.mint.fetch(newMint.address);
        expect(mintAfter.data.supply).toBe(1_000_000_000n);
    });

    test('create mint with custom payer', async () => {
        const customPayer = await generateKeyPairSigner();
        const client = (await createClient({ payer: customPayer })).use(tokenProgram());

        // Airdrop to custom payer
        client.svm.airdrop(customPayer.address, lamports(10_000_000_000n));

        const newMint = await generateKeyPairSigner();

        await client.token.instructions
            .createMint({
                newMint,
                decimals: 6,
                mintAuthority: customPayer.address,
            })
            .sendTransaction();

        // Verify the mint was created with correct decimals
        const mintAccount = await client.token.accounts.mint.fetch(newMint.address);
        expect(mintAccount.data.decimals).toBe(6);
    });
});
