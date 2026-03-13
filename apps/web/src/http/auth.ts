import axios from "axios";
import { api } from "@/lib/axios";

interface User {
	id: string;
	name: string;
	email: string;
}

interface Authentication {
	email: string;
	password: string;
}

interface AuthResponse {
	user: User | null;
	error: string | null;
}

export const auth = async ({
	email,
	password,
}: Authentication): Promise<AuthResponse> => {
	try {
		const response = await api.post<AuthResponse>("auth/authenticate", {
			email,
			password,
		});

		return {
			user: response.data.user,
			error: null,
		};
	} catch (error: unknown) {
		if (axios.isAxiosError<{ message: string }>(error)) {
			return {
				user: null,
				error: error.response?.data?.message || "Authentication failed",
			};
		}
		return {
			user: null,
			error: "Unknown error during authentication",
		};
	}
};
