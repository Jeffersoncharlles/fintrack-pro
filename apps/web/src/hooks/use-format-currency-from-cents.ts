import { useCallback, useMemo } from "react";

export function useFormatCurrencyFromCents() {
	const formatter = useMemo(
		() =>
			new Intl.NumberFormat("pt-BR", {
				style: "currency",
				currency: "BRL",
				minimumFractionDigits: 2,
				maximumFractionDigits: 2,
			}),
		[],
	);

	return useCallback(
		(valueInCents: number) => formatter.format(valueInCents / 100),
		[formatter],
	);
}
