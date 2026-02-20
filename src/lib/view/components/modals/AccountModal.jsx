import authStore, {
	signInWithEmail,
	signInWithGoogle,
	signOut,
	signUpWithEmail,
} from "@/lib/view/actions/auth";
import useAuth from "@/lib/view/actions/auth";
import Button from "@/lib/view/components/interface/Button";
import React, { useState } from "react";
import styles from "./AccountModal.module.less";

export default function AccountModal({ featureMessage, onClose }) {
	const loading = useAuth((state) => state.loading);
	const session = useAuth((state) => state.session);
	const error = useAuth((state) => state.error);
	const [mode, setMode] = useState("sign-in");
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	async function handleSubmit(event) {
		event?.preventDefault?.();

		if (mode === "sign-up") {
			await signUpWithEmail(name.trim(), email.trim(), password);
		} else {
			await signInWithEmail(email.trim(), password);
		}

		if (authStore.getState().session?.user) {
			onClose();
		}
	}

	function handleToggleMode() {
		setMode((currentMode) =>
			currentMode === "sign-up" ? "sign-in" : "sign-up",
		);
	}

	function handleGoogleSignIn() {
		signInWithGoogle();
	}

	async function handleSignOut() {
		await signOut();
		onClose();
	}

	if (session?.user) {
		return (
			<div className={styles.container}>
				<div className={styles.message}>You are signed in.</div>
				<div className={styles.user}>
					{session.user.name || session.user.email || "Authenticated user"}
				</div>
				<div className={styles.row}>
					<Button text="Close" onClick={onClose} />
					<Button text="Sign out" onClick={handleSignOut} />
				</div>
			</div>
		);
	}

	return (
		<form className={styles.container} onSubmit={handleSubmit}>
			<div className={styles.message}>
				{featureMessage ||
					"Create an account to unlock cloud project features like save, open, and duplicate."}
			</div>
			<div className={styles.subtitle}>
				{mode === "sign-up" ? "Create account" : "Sign in"}
			</div>

			{mode === "sign-up" && (
				<input
					className={styles.input}
					type="text"
					placeholder="Name"
					value={name}
					onChange={(e) => setName(e.currentTarget.value)}
					required
				/>
			)}

			<input
				className={styles.input}
				type="email"
				placeholder="Email"
				value={email}
				onChange={(e) => setEmail(e.currentTarget.value)}
				required
			/>
			<input
				className={styles.input}
				type="password"
				placeholder="Password"
				value={password}
				onChange={(e) => setPassword(e.currentTarget.value)}
				required
			/>

			<div className={styles.row}>
				<Button
					text={
						loading
							? "Please wait..."
							: mode === "sign-up"
								? "Create account"
								: "Sign in"
					}
					disabled={loading}
					onClick={handleSubmit}
				/>
				<Button
					text="Continue with Google"
					disabled={loading}
					onClick={handleGoogleSignIn}
				/>
			</div>

			<div className={styles.toggle}>
				{mode === "sign-up" ? "Already have an account?" : "Need an account?"}{" "}
				<button
					type="button"
					className={styles.link}
					onClick={handleToggleMode}
				>
					{mode === "sign-up" ? "Sign in" : "Sign up"}
				</button>
			</div>

			{error && <div className={styles.error}>{error}</div>}
		</form>
	);
}
