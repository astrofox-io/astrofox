import { api, player } from "@/lib/view/global";
import create from "zustand";

const initialState = {
	loading: true,
	session: null,
	error: null,
};

const authStore = create(() => ({
	...initialState,
}));

function setError(error) {
	authStore.setState({
		error: error?.message || "Authentication request failed.",
	});
}

export async function bootstrapSession() {
	authStore.setState({ loading: true, error: null });

	try {
		const session = await api.getSession();
		authStore.setState({ session, loading: false });
	} catch (error) {
		if (error?.status === 401) {
			authStore.setState({
				session: null,
				loading: false,
				error: null,
			});
			return;
		}

		setError(error);
		authStore.setState({ loading: false });
	}
}

export async function signUpWithEmail(name, email, password) {
	authStore.setState({ loading: true, error: null });

	try {
		await api.signUpEmail(name, email, password);
		await bootstrapSession();
	} catch (error) {
		setError(error);
		authStore.setState({ loading: false });
	}
}

export async function signInWithEmail(email, password) {
	authStore.setState({ loading: true, error: null });

	try {
		await api.signInEmail(email, password);
		await bootstrapSession();
	} catch (error) {
		setError(error);
		authStore.setState({ loading: false });
	}
}

export function signInWithGoogle() {
	api.signInWithGoogle();
}

export async function signOut() {
	if (!authStore.getState().session) {
		authStore.setState({ error: null, loading: false });
		return;
	}

	authStore.setState({ loading: true, error: null });

	try {
		await api.signOutUser();
		player.stop();
		authStore.setState({ session: null, loading: false });
	} catch (error) {
		setError(error);
		authStore.setState({ loading: false });
	}
}

export default authStore;
