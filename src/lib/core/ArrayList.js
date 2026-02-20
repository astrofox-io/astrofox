export default class ArrayList extends Array {
	static get [Symbol.species]() {
		return Array;
	}

	isEmpty() {
		return this.length === 0;
	}

	insert(item, index) {
		this.splice(index, 0, item);
	}

	remove(index) {
		return !!this.splice(index, 1).length;
	}

	swap(index, newIndex) {
		if (
			index !== newIndex &&
			index > -1 &&
			index < this.length &&
			newIndex > -1 &&
			newIndex < this.length
		) {
			const tmp = this[index];
			this[index] = this[newIndex];
			this[newIndex] = tmp;
		}
	}

	clear() {
		this.length = 0;
	}
}
