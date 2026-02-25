import useAuth, {
	signInWithEmail,
	signInWithGoogle,
	signUpWithEmail,
} from "@/lib/view/actions/auth";
import Button from "@/lib/view/components/interface/Button";
import React, { useState } from "react";

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
		<div className={"min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top,_#1f2a38_0%,_#101014_70%)]"}>
			<form className={"w-[420px] flex flex-col gap-2.5 p-6 bg-[rgba(14,_20,_28,_0.92)] border border-[#2f3f55]"} onSubmit={handleSubmit}>
				<div className={"text-[26px] font-bold tracking-[0.04em]"}>Astrofox</div>
				<div className={"text-[13px] opacity-[0.8] mb-2"}>
					{mode === "sign-up" ? "Create account" : "Sign in"}
				</div>

				{mode === "sign-up" && (
					<input
						className={"bg-[#0d1219] text-[#fff] border border-[#3c4b60] py-2 px-2.5 text-[13px]"}
						type="text"
						placeholder="Name"
						value={name}
						onChange={(e) => setName(e.currentTarget.value)}
						required
					/>
				)}
				<input
					className={"bg-[#0d1219] text-[#fff] border border-[#3c4b60] py-2 px-2.5 text-[13px]"}
					type="email"
					placeholder="Email"
					value={email}
					onChange={(e) => setEmail(e.currentTarget.value)}
					required
				/>
				<input
					className={"bg-[#0d1219] text-[#fff] border border-[#3c4b60] py-2 px-2.5 text-[13px]"}
					type="password"
					placeholder="Password"
					value={password}
					onChange={(e) => setPassword(e.currentTarget.value)}
					required
				/>

				<div className={"flex gap-1.5 [flex-wrap:wrap]"}>
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

				<div className={"text-xs opacity-[0.85]"}>
					{mode === "sign-up" ? "Already have an account?" : "Need an account?"}{" "}
					<button
						type="button"
						className={"bg-transparent border-0 p-0 text-[#62d0ff] cursor-pointer"}
						onClick={toggleMode}
						onKeyDown={handleToggleModeKeyDown}
					>
						{mode === "sign-up" ? "Sign in" : "Sign up"}
					</button>
				</div>

				{error && <div className={"text-xs text-[#ff8f8f]"}>{error}</div>}
			</form>
		</div>
	);
}
