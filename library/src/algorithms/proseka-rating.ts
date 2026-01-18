import { ThrowIf } from "../util/throw-if";

/**
 * Calculates the rating for a proseka score using the 39S rating system.
 * Judgement weights are accurate to ranked match standards.
 *
 * @param perfectCount - The number of perfects the user got. Worth 3 points each.
 * @param greatCount - The number of greats the user got. Worth 2 points each.
 * @param goodCount - The number of goods the user got. Worth 1 point each.
 * @param badCount - The number of bads the user got. Worth 0.5 points each.
 * @param missCount - The number of misses the user got. Worth 0 points.
 * @param internalChartLevel - The internal chart level (constant).
 * @param maxCombo - The maximum combo achievable on the chart.
 */
export function calculate(
	perfectCount: number,
	greatCount: number,
	goodCount: number,
	badCount: number,
	missCount: number,
	internalChartLevel: number,
	maxCombo: number
) {
	// Validate inputs
	ThrowIf.negative(perfectCount, "Perfect count cannot be negative.", { perfectCount });
	ThrowIf.negative(greatCount, "Great count cannot be negative.", { greatCount });
	ThrowIf.negative(goodCount, "Good count cannot be negative.", { goodCount });
	ThrowIf.negative(badCount, "Bad count cannot be negative.", { badCount });
	ThrowIf.negative(missCount, "Miss count cannot be negative.", { missCount });
	ThrowIf.negative(maxCombo, "Max combo cannot be negative.", { maxCombo });
	ThrowIf.negative(internalChartLevel, "Chart level cannot be negative.", { internalChartLevel });

	const rawScore = perfectCount * 3 + greatCount * 2 + goodCount + badCount * 0.5;
	const maxScore = maxCombo * 3;

	ThrowIf(rawScore > maxScore, "Score cannot be greater than maximum possible score.", {
		rawScore,
		maxScore,
	});

	const percent = (rawScore / maxScore) * 100;

	// 39S Rating System:
	// 100%   -> constant + 4
	// 99.5%  -> constant + 3
	// 99%    -> constant + 2
	// 98%    -> constant + 1
	// 97%    -> constant + 0
	// Every -3% below 97% is -2 rating
	// 50% always equals 0

	let rating: number;

	if (percent >= 100) {
		rating = internalChartLevel + 4;
	} else if (percent >= 99.5) {
		rating = internalChartLevel + 3 + (percent - 99.5) * 2;
	} else if (percent >= 99) {
		rating = internalChartLevel + 2 + (percent - 99) * 2;
	} else if (percent >= 98) {
		rating = internalChartLevel + 1 + (percent - 98);
	} else if (percent >= 97) {
		rating = internalChartLevel + (percent - 97);
	} else if (percent >= 50) {
		// From 97% to 50% is a 47% range
		// Rating goes from constant to 0
		// Every -3% is -2 rating, so -47% is roughly -(47/3)*2 = -31.33
		const percentBelow97 = 97 - percent;
		rating = internalChartLevel - (percentBelow97 / 3) * 2;
	} else {
		rating = 0;
	}

	return Math.max(rating, 0);
}
