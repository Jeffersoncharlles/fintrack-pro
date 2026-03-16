import { Input } from "@/components/ui/input";

export function PixTransferPage() {
	return (
		<div className="flex flex-1 flex-col">
			<div className="@container/main flex flex-1 flex-col gap-2">
				<div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
					<Input type="text" placeholder="Digite o valor..." />
					<div className="px-4 lg:px-6">
						<Input type="text" placeholder="Digite o destinatário..." />
					</div>
				</div>
			</div>
		</div>
	);
}
