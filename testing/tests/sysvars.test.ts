import { describe, test, expect } from 'bun:test';
import { createLitesvmClient } from './_helpers';

describe('Sysvars (API Reference)', () => {
    test('getClock returns all documented properties', async () => {
        const client = await createLitesvmClient();
        client.svm.withSysvars();

        const clock = client.svm.getClock();
        expect(clock.slot).toBeDefined();
        expect(clock.epoch).toBeDefined();
        expect(clock.unixTimestamp).toBeDefined();
        expect(clock.epochStartTimestamp).toBeDefined();
        expect(clock.leaderScheduleEpoch).toBeDefined();
    });

    test('setClock writes all clock fields', async () => {
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

    test('getRent returns documented properties', async () => {
        const client = await createLitesvmClient();
        client.svm.withSysvars();

        const rent = client.svm.getRent();
        expect(rent.lamportsPerByteYear).toBeGreaterThan(0n);
        expect(rent.exemptionThreshold).toBeGreaterThan(0);
        expect(rent.burnPercent).toBeDefined();
    });

    test('minimumBalanceForRentExemption for different sizes', async () => {
        const client = await createLitesvmClient();

        const sizes = [0n, 100n, 1000n];
        let prevMin = 0n;
        for (const size of sizes) {
            const min = client.svm.minimumBalanceForRentExemption(size);
            expect(min).toBeGreaterThan(0n);
            expect(min).toBeGreaterThanOrEqual(prevMin);
            prevMin = min;
        }
    });

    test('getEpochSchedule returns documented properties', async () => {
        const client = await createLitesvmClient();
        client.svm.withSysvars();

        const es = client.svm.getEpochSchedule();
        expect(es.slotsPerEpoch).toBeGreaterThan(0n);
        expect(es.leaderScheduleSlotOffset).toBeDefined();
        expect(es.warmup).toBeDefined();
        expect(es.firstNormalEpoch).toBeDefined();
        expect(es.firstNormalSlot).toBeDefined();
    });

    test('getEpochRewards returns documented properties', async () => {
        const client = await createLitesvmClient();
        client.svm.withSysvars();

        const rewards = client.svm.getEpochRewards();
        expect(rewards.active).toBeDefined();
        expect(rewards.totalRewards).toBeDefined();
        expect(rewards.distributedRewards).toBeDefined();
        expect(rewards.totalPoints).toBeDefined();
        expect(rewards.numPartitions).toBeDefined();
        expect(rewards.distributionStartingBlockHeight).toBeDefined();
    });

    test('getSlotHashes returns array', async () => {
        const client = await createLitesvmClient();
        client.svm.withSysvars();

        const slotHashes = client.svm.getSlotHashes();
        expect(Array.isArray(slotHashes)).toBe(true);

        if (slotHashes.length > 0) {
            expect(slotHashes[0].slot).toBeDefined();
            expect(slotHashes[0].hash).toBeDefined();
        }
    });

    test('getSlotHistory returns nextSlot', async () => {
        const client = await createLitesvmClient();
        client.svm.withSysvars();

        const slotHistory = client.svm.getSlotHistory();
        expect(slotHistory.nextSlot).toBeDefined();
    });

    test('getLastRestartSlot and setLastRestartSlot', async () => {
        const client = await createLitesvmClient();
        client.svm.withSysvars();

        const lastRestart = client.svm.getLastRestartSlot();
        expect(lastRestart).toBeDefined();

        client.svm.setLastRestartSlot(500n);
        const after = client.svm.getLastRestartSlot();
        expect(after).toBe(500n);
    });

    test('getStakeHistory returns data', async () => {
        const client = await createLitesvmClient();
        client.svm.withSysvars();

        const stakeHistory = client.svm.getStakeHistory();
        expect(stakeHistory).toBeDefined();
    });
});
