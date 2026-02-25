// @ts-nocheck
import AudioReactor from "@/lib/audio/AudioReactor";
import EntityList from "@/lib/core/EntityList";

export default class Reactors extends EntityList {
	[key: string]: any;
	constructor() {
		super();

		this.results = {};
	}

	addReactor(reactor) {
		return this.addElement(reactor ?? new AudioReactor());
	}

	removeReactor(reactor) {
		this.removeElement(reactor);
	}

	clearReactors() {
		this.clear();
	}

	getResults(data) {
		if (data.hasUpdate) {
			this.results = this.reduce((memo, reactor) => {
				memo[reactor.id] = reactor.parse(data).output;
				return memo;
			}, {});
		}
		return this.results;
	}
}
