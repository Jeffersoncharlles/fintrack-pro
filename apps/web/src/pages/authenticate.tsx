import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const authenticateFormDataSchema = z.object({
	email: z.string().email(),
	password: z.string().min(6),
});
export type AuthenticateFormDataSchema = z.infer<
	typeof authenticateFormDataSchema
>;

export function AuthenticatePage() {
	const {
		register,
		handleSubmit,
		formState: { isSubmitting, errors },
	} = useForm<AuthenticateFormDataSchema>({
		resolver: zodResolver(authenticateFormDataSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	const handleFormSubmit = async (data: AuthenticateFormDataSchema) => {};

	return (
		<main className="min-h-screen  px-4 py-10">
			<Card>
				<CardHeader>
					<CardTitle>Authenticate</CardTitle>
					<CardDescription>
						To authenticate, please use your email and password
					</CardDescription>
				</CardHeader>

				<CardContent>
					<form onSubmit={handleSubmit(handleFormSubmit)}>
						<FieldGroup>
							<Field>
								<FieldLabel htmlFor="fieldgroup-email">Email</FieldLabel>
								<Input
									id="fieldgroup-email"
									type="email"
									{...register("email")}
								/>
							</Field>
							<Field>
								<FieldLabel htmlFor="fieldgroup-password">Password</FieldLabel>
								<Input
									id="fieldgroup-password"
									type="password"
									{...register("password")}
								/>
							</Field>

							<Field orientation="horizontal">
								<Button disabled={isSubmitting} type="submit">
									SignIn
								</Button>
							</Field>
						</FieldGroup>
					</form>
				</CardContent>
			</Card>
		</main>
	);
}
