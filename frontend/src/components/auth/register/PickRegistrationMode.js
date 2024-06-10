// import { useEffect, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { toast } from "react-toastify";
import { Fetch } from "../../../utils/Fetch";

export default function PickRegistationMode({
	regMode,
	setRegMode,
	setGoogleInfo,
	setGeneralInfo,
	setLoading,
	clientID,
	handleNextStep,
}) {
	return (
		<form className="flex flex-col gap-4 w-full" onSubmit={() => {}}>
			<h6 className="text-center">Select Mode Of Registration</h6>

			<div className="flex gap-4 items-center justify-center sm:flex flex-col w-min mx-auto">
				<div
					className={`flex-1 flex items-center justify-center ${
						regMode === "GOOGLE" ? "border-blue-500" : ""
					}`}
					onClick={() => {
						setRegMode("GOOGLE");
					}}>
					<GoogleLogin
						size="large"
						containerProps={{}}
						onSuccess={async (credentialResponse) => {
							setLoading(true);
							console.log(credentialResponse);
							const jwt_token = credentialResponse.credential
								? credentialResponse.credential
								: null;

							const payload = await Fetch({
								url: `/auth/verify-google`,
								method: "POST",
								data: {
									client_id: clientID,
									jwtToken: jwt_token,
								},
							});

							if (payload?.data?.message) {
								toast(payload.data.message, {
									type: "warning",
								});
								setLoading(false);
								return;
							}

							const email_verified = payload.data.email_verified;

							if (email_verified) {
								const email = payload.data.email;
								const name = payload.data.name;
								console.log(email, name);
								setGoogleInfo({
									jwt_token,
									verified: true,
									email_id: email,
									name,
								});
								setGeneralInfo({
									email_id: email,
									name: name,
								});
								setLoading(false);
								handleNextStep();
							} else {
								setGoogleInfo({
									verified: false,
								});
								setLoading(false);
							}
							setLoading(false);
						}}
						onError={() => {
							toast("Login Failed", { type: "warning" });
						}}
						onNonOAuthError={(err) => {
							toast("Google login failed! Try again", {
								type: "warning",
							});
						}}></GoogleLogin>
				</div>

				<div
					className={`flex-1 w-full flex items-center gap-2 flex-col px-4 py-2 border rounded-lg 
              ${regMode === "NORMAL" ? "border-2 border-blue-500" : ""}
              `}
					onClick={() => {
						setGoogleInfo({});
						setRegMode("NORMAL");
						handleNextStep();
					}}>
					Use Email
				</div>
			</div>
		</form>
	);
}
