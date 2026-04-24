import { describe, test, expect } from 'bun:test';
import { generateKeyPairSigner, lamports } from '@solana/kit';
import { createLitesvmClient } from './_helpers';

describe('Time-Based Testing', () => {
    test('basic clock manipulation with warpToSlot', async () => {
        const client = await createLitesvmClient();
        client.svm.withSysvars();

        const initialClock = client.svm.getClock();
        expect(initialClock.slot).toBe(0n);

        client.svm.warpToSlot(1000n);
        const afterWarp = client.svm.getClock();
        expect(afterWarp.slot).toBe(1000n);

        client.svm.warpToSlot(100000n);
        const afterWarp2 = client.svm.getClock();
        expect(afterWarp2.slot).toBe(100000n);
    });

    test('manual clock manipulation with setClock', async () => {
        const client = await createLitesvmClient();
        client.svm.withSysvars();

        const clock = client.svm.getClock();
        clock.slot = 5000n;
        clock.epoch = 3n;
        clock.unixTimestamp = 1700000000n;
        clock.epochStartTimestamp = 1699900000n;
        clock.leaderScheduleEpoch = 4n;
        client.svm.setClock(clock);

        const after = client.svm.getClock();
        expect(after.slot).toBe(5000n);
        expect(after.epoch).toBe(3n);
        expect(after.unixTimestamp).toBe(1700000000n);
        expect(after.epochStartTimestamp).toBe(1699900000n);
        expect(after.leaderScheduleEpoch).toBe(4n);
    });

    test('time-locked vault pattern with setAccount and warpToSlot', async () => {
        const client = await createLitesvmClient();
        client.svm
            .withSigverify(false)
            .withBlockhashCheck(false)
            .withSysvars();

        const programId = (await generateKeyPairSigner()).address;
        const vaultAccount = await generateKeyPairSigner();

        const unlockSlot = 10000n;
        const lockedAmount = 5_000_000_000n;

        const vaultData = new Uint8Array(1 + 8 + 8);
        const view = new DataView(vaultData.buffer);
        vaultData[0] = 0x01;
        view.setBigUint64(1, unlockSlot, true);
        view.setBigUint64(9, lockedAmount, true);

        const minBalance = client.svm.minimumBalanceForRentExemption(BigInt(vaultData.length));

        client.svm.setAccount({
            address: vaultAccount.address,
            data: vaultData,
            executable: false,
            lamports: lamports(minBalance + lockedAmount),
            programAddress: programId,
            space: BigInt(vaultData.length),
        });

        const beforeClock = client.svm.getClock();
        expect(beforeClock.slot).toBeLessThan(unlockSlot);

        client.svm.warpToSlot(unlockSlot + 100n);
        const afterClock = client.svm.getClock();
        expect(afterClock.slot).toBeGreaterThan(unlockSlot);

        const vault = client.svm.getAccount(vaultAccount.address);
        expect(vault.exists).toBe(true);
        if (vault.exists) {
            const vaultView = new DataView(vault.data.buffer, vault.data.byteOffset);
            expect(vaultView.getBigUint64(1, true)).toBe(unlockSlot);
            expect(vaultView.getBigUint64(9, true)).toBe(lockedAmount);
        }
    });

    test('timestamp-based testing with setClock', async () => {
        const client = await createLitesvmClient();
        client.svm.withSysvars();

        const clock = client.svm.getClock();
        const startTimestamp = 1700000000n;
        clock.unixTimestamp = startTimestamp;
        client.svm.setClock(clock);

        const before = client.svm.getClock();
        expect(before.unixTimestamp).toBe(startTimestamp);

        const oneHourLater = client.svm.getClock();
        oneHourLater.slot = before.slot + 9000n;
        oneHourLater.unixTimestamp = startTimestamp + 3600n;
        client.svm.setClock(oneHourLater);

        const after = client.svm.getClock();
        expect(after.unixTimestamp).toBe(startTimestamp + 3600n);
        expect(after.slot).toBe(9000n);
    });

    test('epoch schedule is readable', async () => {
        const client = await createLitesvmClient();
        client.svm.withSysvars();

        const epochSchedule = client.svm.getEpochSchedule();
        expect(epochSchedule.slotsPerEpoch).toBeGreaterThan(0n);
        expect(epochSchedule.firstNormalSlot).toBeGreaterThanOrEqual(0n);
        expect(epochSchedule.firstNormalEpoch).toBeGreaterThanOrEqual(0n);
    });
});
