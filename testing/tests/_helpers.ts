import { createClient, generateKeyPairSigner } from '@solana/kit';
import { litesvm } from '@solana/kit-plugin-litesvm';
import { signer } from '@solana/kit-plugin-signer';

export async function createLitesvmClient() {
    const mySigner = await generateKeyPairSigner();
    return createClient().use(signer(mySigner)).use(litesvm());
}
