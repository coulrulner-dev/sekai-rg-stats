import t from "tap";
import { calculate } from "./proseka-rating";

const LEVEL = 30; // example chart constant
t.test("Proseka Rating Tests (39S System - Linear)", (t) => {
	// Test exact thresholds
	t.equal(calculate(300, 0, 0, 0, 0, LEVEL, 300), LEVEL + 4, "100% should be constant + 4.");

	t.equal(calculate(299, 0, 1, 0, 0, LEVEL, 300), LEVEL + 3, "99.5% should be constant + 3.");

	t.equal(calculate(297, 3, 0, 0, 0, LEVEL, 300), LEVEL + 2, "99% should be constant + 2.");

	t.equal(calculate(294, 6, 0, 0, 0, LEVEL, 300), LEVEL + 1, "98% should be constant + 1.");

	t.equal(calculate(291, 9, 0, 0, 0, LEVEL, 300), LEVEL, "97% should be exactly constant.");

	t.equal(calculate(0, 150, 150, 0, 0, LEVEL, 300), 0, "50% should always return 0 rating.");

	t.equal(calculate(0, 0, 0, 0, 300, LEVEL, 300), 0, "0% (300 misses) should return 0 rating.");

	// Test linear interpolation between thresholds
	t.equal(
		calculate(298, 2, 0, 0, 0, LEVEL, 300),
		LEVEL + 2.5,
		"99.25% (midpoint between 99% and 99.5%) should be constant + 2.5."
	);

	t.equal(
		calculate(295, 5, 0, 0, 0, LEVEL, 300),
		LEVEL + 1.5,
		"98.5% (midpoint between 98% and 99%) should be constant + 1.5."
	);

	t.equal(
		calculate(292, 8, 0, 0, 0, LEVEL, 300),
		LEVEL + 0.5,
		"97.5% (midpoint between 97% and 98%) should be constant + 0.5."
	);

	// Test the linear decay below 97%
	const rating73_5 = calculate(195, 66, 39, 0, 0, LEVEL, 300); // 73.5%
	t.equal(
		rating73_5,
		LEVEL * ((73.5 - 50) / 47),
		"73.5% should follow linear formula from 97% to 50%."
	);

	t.end();
});

t.test("Proseka Rating Edge Cases", (t) => {
	// Chart level 0 should still work
	t.equal(
		calculate(300, 0, 0, 0, 0, 0, 300),
		4,
		"Perfect score on level 0 chart should return 4 rating (0 + 4)."
	);

	t.equal(calculate(0, 0, 0, 0, 300, 0, 300), 0, "0% score on level 0 chart should return 0.");

	// High level chart
	const HIGH_LEVEL = 35;
	t.equal(
		calculate(300, 0, 0, 0, 0, HIGH_LEVEL, 300),
		HIGH_LEVEL + 4,
		"Perfect score on high level chart should be constant + 4."
	);

	// Bad judgements are worth 0 points (same as miss)
	t.equal(
		calculate(300, 0, 0, 0, 0, LEVEL, 300),
		calculate(295, 0, 0, 5, 0, LEVEL, 300),
		"5 bads should be equivalent to 5 misses (both worth 0)."
	);

	t.end();
});

t.test("Proseka Rating Validation Tests", (t) => {
	// Negative inputs should throw
	t.throws(
		() => calculate(-1, 0, 0, 0, 0, 10, 100),
		/Perfect count cannot be negative/u,
		"Negative perfectCount should throw."
	);

	t.throws(
		() => calculate(101, 0, 0, 0, 0, 10, 100),
		/Score cannot be greater than maximum possible score/u,
		"Score exceeding maxCombo*3 should throw."
	);

	t.throws(
		() => calculate(0, 0, 0, 0, 0, -1, 300),
		/Chart level cannot be negative/u,
		"Negative chart level should throw."
	);

	t.throws(
		() => calculate(0, -5, 0, 0, 0, 10, 100),
		/Great count cannot be negative/u,
		"Negative greatCount should throw."
	);

	t.end();
});
