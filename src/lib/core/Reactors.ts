import AudioReactor from "@/lib/audio/AudioReactor";
import EntityList from "@/lib/core/EntityList";
import type { RenderFrameData } from "@/lib/types";

export default class Reactors extends EntityList {
	results: Record<string, number> = {};

	addReactor(reactor?: unknown) {
		return this.addElement(reactor ?? new AudioReactor({}));
	}

	removeReactor(reactor: unknown) {
		this.removeElement(reactor);
	}

	clearReactors() {
		this.clear();
	}

	getResults(data: RenderFrameData): Record<string, number> {
		if (data.hasUpdate) {
			this.results = this.reduce(
				(
					memo: Record<string, number>,
					reactor: {
						enabled: boolean;
						id: string;
						parse: (data: RenderFrameData) => { output: number };
					},
				) => {
					if (reactor.enabled) {
						memo[reactor.id] = reactor.parse(data).output;
					}
					return memo;
				},
				{} as Record<string, number>,
			);
		}
		return this.results;
	}
}
