export type Activity = {
	id: string;
	type: 'Cycling' | 'Sleep' | 'Run' | 'Other';
	durationMin: number;
	start: string;
	end: string;
	intensity: number; // 0..1
};

export const overviewMock = {
	date: '2025-06-27',
	recovery: { score: 0.65, hrv: 73, rhr: 54 },
	sleep: { durationMin: 507, targetMin: 480 },
	strain: { score: 18.4 },
	activities: [
		{ id: 'ride', type: 'Cycling', durationMin: 97, start: '13:47', end: '16:14', intensity: 0.8 },
		{ id: 'sleep', type: 'Sleep', durationMin: 527, start: '22:35', end: '08:29', intensity: 0.2 },
	] as Activity[],
	trends: {
		hrv: [70, 71, 72, 73, 69, 74, 73],
		rhr: [56, 55, 55, 54, 55, 53, 54],
		stress: [0.8, 1.2, 1.0, 1.6, 2.4, 2.0, 1.7],
	},
};
