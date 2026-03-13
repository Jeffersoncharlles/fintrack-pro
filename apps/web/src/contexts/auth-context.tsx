import { useQuery } from "@tanstack/react-query";
import { createContext, type ReactNode, useContext } from "react";
import { auth } from "@/http/auth";
import { me } from "@/http/me";
import { queryClient } from "@/lib/react-query";

interface User {
	id: string;
	name: string;
	email: string;
}

interface SignInCredentials {
	email: string;
	password: string;
}

interface SignInResponse {
	success: boolean;
	error?: string | null;
}

interface AuthContextType {
	user: User | null;
	isAuthenticated: boolean;
	signIn: (credentials: SignInCredentials) => Promise<SignInResponse>;
	signOut: () => Promise<void>;
	loading: boolean;
}

const AuthContext = createContext({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
	const { data: user, isLoading: loading } = useQuery({
		queryKey: ["profile"],
		queryFn: async () => {
			try {
				const userData = await me();
				return userData;
			} catch {
				return null;
			}
		},
		staleTime: 1000 * 60 * 15, // 15 minutos,
		retry: false,
	});

	const isAuthenticated = !!user;

	async function signIn({
		email,
		password,
	}: SignInCredentials): Promise<SignInResponse> {
		const { user: loggedUser, error } = await auth({ email, password });
		if (loggedUser) {
			queryClient.setQueryData(["profile"], loggedUser);
			return { success: true };
		}
		return { success: false, error };
	}

	async function signOut() {
		try {
			// await logout(); //todo: implementar logout na API e descomentar isso
		} finally {
			queryClient.setQueryData(["profile"], null);
		}
	}

	return (
		<AuthContext.Provider
			value={{ user: user || null, isAuthenticated, signIn, signOut, loading }}
		>
			{children}
		</AuthContext.Provider>
	);
}

export const useAuth = () => useContext(AuthContext);
