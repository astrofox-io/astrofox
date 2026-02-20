import useAuth, {
	signInWithEmail,
	signInWithGoogle,
	signUpWithEmail,
} from "@/lib/view/actions/auth";
import Button from "@/lib/view/components/interface/Button";
import React, { useState } from "react";
import styles from "./AuthScreen.module.less";

export default function AuthScreen() {
	const loading = useAuth((state) => state.loading);
	const error = useAuth((state) => state.error);
	const [mode, setMode] = useState("sign-in");
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	async function handleSubmit(e) {
		e?.preventDefault?.();

		if (mode === "sign-up") {
			await signUpWithEmail(name.trim(), email.trim(), password);
			return;
		}

		await signInWithEmail(email.trim(), password);
	}

	function toggleMode() {
		setMode(mode === "sign-up" ? "sign-in" : "sign-up");
	}

	function handleToggleModeKeyDown(event) {
		if (event.key === "Enter" || event.key === " ") {
			event.preventDefault();
			toggleMode();
		}
	}

	return (
		<div className={styles.page}>
			<form className={styles.card} onSubmit={handleSubmit}>
				<div className={styles.title}>Astrofox</div>
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
						onClick={signInWithGoogle}
					/>
				</div>

				<div className={styles.toggle}>
					{mode === "sign-up" ? "Already have an account?" : "Need an account?"}{" "}
					<button
						type="button"
						className={styles.link}
						onClick={toggleMode}
						onKeyDown={handleToggleModeKeyDown}
					>
						{mode === "sign-up" ? "Sign in" : "Sign up"}
					</button>
				</div>

				{error && <div className={styles.error}>{error}</div>}
			</form>
		</div>
	);
}
