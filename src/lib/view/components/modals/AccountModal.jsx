import authStore, {
	signInWithEmail,
	signInWithGoogle,
	signOut,
	signUpWithEmail,
} from "@/lib/view/actions/auth";
import useAuth from "@/lib/view/actions/auth";
import Button from "@/lib/view/components/interface/Button";
import React, { useState } from "react";

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
			<div className={"flex flex-col gap-[10px] min-w-[420px]"}>
				<div className={"text-xs text-[var(--text200)]"}>You are signed in.</div>
				<div className={"text-[13px] text-[var(--text100)]"}>
					{session.user.name || session.user.email || "Authenticated user"}
				</div>
				<div className={"flex gap-[6px] [flex-wrap:wrap]"}>
					<Button text="Close" onClick={onClose} />
					<Button text="Sign out" onClick={handleSignOut} />
				</div>
			</div>
		);
	}

	return (
		<form className={"flex flex-col gap-[10px] min-w-[420px]"} onSubmit={handleSubmit}>
			<div className={"text-xs text-[var(--text200)]"}>
				{featureMessage ||
					"Create an account to unlock cloud project features like save, open, and duplicate."}
			</div>
			<div className={"text-xs font-bold uppercase opacity-[0.85]"}>
				{mode === "sign-up" ? "Create account" : "Sign in"}
			</div>

			{mode === "sign-up" && (
				<input
					className={"bg-[#181818] text-[#fff] border border-[#555] p-[7px_8px] text-xs"}
					type="text"
					placeholder="Name"
					value={name}
					onChange={(e) => setName(e.currentTarget.value)}
					required
				/>
			)}

			<input
				className={"bg-[#181818] text-[#fff] border border-[#555] p-[7px_8px] text-xs"}
				type="email"
				placeholder="Email"
				value={email}
				onChange={(e) => setEmail(e.currentTarget.value)}
				required
			/>
			<input
				className={"bg-[#181818] text-[#fff] border border-[#555] p-[7px_8px] text-xs"}
				type="password"
				placeholder="Password"
				value={password}
				onChange={(e) => setPassword(e.currentTarget.value)}
				required
			/>

			<div className={"flex gap-[6px] [flex-wrap:wrap]"}>
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

			<div className={"text-xs opacity-[0.9]"}>
				{mode === "sign-up" ? "Already have an account?" : "Need an account?"}{" "}
				<button
					type="button"
					className={"bg-transparent border-0 p-0 text-[#62d0ff] cursor-pointer"}
					onClick={handleToggleMode}
				>
					{mode === "sign-up" ? "Sign in" : "Sign up"}
				</button>
			</div>

			{error && <div className={"text-xs text-[#ff8f8f]"}>{error}</div>}
		</form>
	);
}
