import { useState, useEffect } from "react";
import {
	ActivityIndicator,
	Text,
	TextInput,
	Pressable,
	View,
	ScrollView,
	KeyboardAvoidingView,
	Platform,
	Image,
	useColorScheme,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Card, useThemeColor } from "heroui-native";
import { authClient } from "@/lib/auth-client";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useMutation } from "convex/react";
import { api } from "@rackd/backend/convex/_generated/api";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SignupPage() {
	const router = useRouter();
	const colorScheme = useColorScheme();
	const insets = useSafeAreaInsets();
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [termsAccepted, setTermsAccepted] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [errors, setErrors] = useState<{
		firstName?: string;
		lastName?: string;
		username?: string;
		email?: string;
		password?: string;
		confirmPassword?: string;
		terms?: string;
		root?: string;
	}>({});

	const syncUserToCustomTable = useMutation(api.auth.syncUserToCustomTable);
	const createPlayerProfile = useMutation(api.auth.createPlayerProfile);
	const syncSessionFromToken = useMutation(api.auth.syncSessionFromToken);
	const syncEmailPasswordAccount = useMutation(api.auth.syncEmailPasswordAccount);

	const mutedColor = useThemeColor("muted");
	const foregroundColor = useThemeColor("foreground");
	const dangerColor = useThemeColor("danger");
	const surfaceColor = useThemeColor("surface");
	const dividerColor = useThemeColor("divider");
	const accentColor = useThemeColor("accent");
	
	// Icon color: black for light mode, white/light for dark mode
	const iconColor = colorScheme === "dark" ? "#FFFFFF" : "#000000";
	const VERSION = "1.0.0";

	// Check username availability in real-time
	const isUsernameAvailable = useQuery(
		api.users.checkUsername,
		username && username.length >= 3 && /^[a-z0-9-_]+$/.test(username)
			? { username: username.toLowerCase() }
			: "skip"
	);

	// Validate username availability
	useEffect(() => {
		if (username && username.length >= 3 && /^[a-z0-9-_]+$/.test(username)) {
			if (isUsernameAvailable === false) {
				setErrors((prev) => ({
					...prev,
					username: "Username is already taken",
				}));
			} else if (isUsernameAvailable === true && errors.username === "Username is already taken") {
				// Clear the error if username becomes available
				setErrors((prev) => {
					const newErrors = { ...prev };
					if (newErrors.username === "Username is already taken") {
						delete newErrors.username;
					}
					return newErrors;
				});
			}
		}
	}, [username, isUsernameAvailable, errors.username]);

	const validateForm = () => {
		const newErrors: typeof errors = {};

		// First name validation
		if (!firstName.trim()) {
			newErrors.firstName = "First name is required";
		}

		// Last name validation
		if (!lastName.trim()) {
			newErrors.lastName = "Last name is required";
		}

		// Username validation
		if (!username.trim()) {
			newErrors.username = "Username is required";
		} else if (username.length < 3) {
			newErrors.username = "Username must be at least 3 characters";
		} else if (username.length > 20) {
			newErrors.username = "Username must be at most 20 characters";
		} else if (!/^[a-z0-9-_]+$/.test(username)) {
			newErrors.username =
				"Username can only contain lowercase letters, numbers, hyphens, and underscores";
		} else if (isUsernameAvailable === false) {
			newErrors.username = "Username is already taken";
		}

		// Email validation
		if (!email.trim()) {
			newErrors.email = "Email is required";
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			newErrors.email = "Please enter a valid email address";
		}

		// Password validation
		if (!password) {
			newErrors.password = "Password is required";
		} else if (password.length < 8) {
			newErrors.password = "Password must be at least 8 characters";
		}

		// Confirm password validation
		if (!confirmPassword) {
			newErrors.confirmPassword = "Please confirm your password";
		} else if (password !== confirmPassword) {
			newErrors.confirmPassword = "Passwords don't match";
		}

		// Terms validation
		if (!termsAccepted) {
			newErrors.terms = "You must accept the terms and conditions";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSignup = async () => {
		if (!validateForm()) {
			return;
		}

		setIsLoading(true);
		setErrors({});

		try {
			const result = await authClient.signUp.email({
				email,
				password,
				name: `${firstName} ${lastName}`,
			});

			if (result.error) {
				throw result.error;
			}

			const betterAuthUserId = result.data?.user?.id;
			const sessionToken = result.data?.token;

			// Immediately sync user to custom users table
			try {
				await syncUserToCustomTable({
					email,
					name: `${firstName} ${lastName}`,
					username: username.toLowerCase(),
					betterAuthUserId,
				});
			} catch (err: any) {
				console.warn("Failed to sync user to custom table:", err);
				// If username error, show it to user
				if (err?.message?.includes("Username")) {
					setErrors({ username: err.message });
					setIsLoading(false);
					return;
				}
				// Continue anyway - hook might handle it
			}

			// Sync account and session immediately if onCreate hook hasn't fired yet
			if (betterAuthUserId) {
				// Sync email/password account
				try {
					await syncEmailPasswordAccount({
						betterAuthUserId,
						email,
					});
				} catch (err: any) {
					console.warn("Failed to sync account (may already exist):", err);
					// Continue anyway - hook might handle it
				}

				// Sync session if token is available
				if (sessionToken) {
					try {
						await syncSessionFromToken({
							token: sessionToken,
							betterAuthUserId,
						});
					} catch (err: any) {
						console.warn("Failed to sync session (may already exist):", err);
						// Continue anyway - hook might handle it
					}
				}
			}

			// Create player profile immediately
			try {
				await createPlayerProfile();
			} catch (err: any) {
				// Player profile creation is idempotent, so errors are non-critical
				console.warn("Failed to create player profile (may already exist):", err);
			}

			// Navigate to home on success
			router.replace("/(drawer)");
		} catch (error: any) {
			console.error("Signup error:", error);
			const errorMessage =
				error?.message ||
				error?.code === "EMAIL_ALREADY_EXISTS"
					? "An account with this email already exists."
					: "Failed to create account. Please try again.";

			setErrors({ root: errorMessage });
			setIsLoading(false);
		}
	};

	const handleSocialSignup = async (provider: "google" | "apple") => {
		setIsLoading(true);
		setErrors({});

		await authClient.signIn.social(
			{
				provider,
			},
			{
				onError: (error) => {
					setErrors({
						root:
							error.error?.message ||
							"Failed to redirect to social sign up. Please try again.",
					});
					setIsLoading(false);
				},
				onSuccess: () => {
					// Social login redirects automatically
				},
				onFinished: () => {
					setIsLoading(false);
				},
			},
		);
	};

	return (
		<View className="flex-1 bg-background">
			<StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				className="flex-1"
			>
				<View className="flex-1">
					{/* Logo at top */}
					<View
						className="items-center pt-6"
						style={{ paddingTop: insets.top + 24 }}
					>
						<Image
							source={require("@/assets/images/icon.png")}
							style={{
								width: 80,
								height: 80,
								tintColor: iconColor,
							}}
							resizeMode="contain"
						/>
					</View>

					{/* Form in middle */}
					<ScrollView
						contentContainerStyle={{
							flexGrow: 1,
							justifyContent: "center",
							padding: 24,
						}}
						keyboardShouldPersistTaps="handled"
					>
						<Card variant="secondary" className="p-6">
						<View className="mb-6">
							<Text className="text-2xl font-bold text-foreground mb-2 text-center">
								Create an account
							</Text>
							<Text className="text-base text-muted-foreground text-center">
								Enter your information to get started
							</Text>
						</View>

						{/* Social Signup Buttons */}
						<View className="flex-row gap-3 mb-6">
							<Pressable
								onPress={() => handleSocialSignup("google")}
								disabled={isLoading}
								className="flex-1 bg-surface border border-divider rounded-lg p-4 flex-row items-center justify-center active:opacity-70"
								style={{ borderColor: accentColor }}
							>
								<Ionicons
									name="logo-google"
									size={16}
									color={foregroundColor}
									style={{ marginRight: 8 }}
								/>
								<Text className="text-foreground font-medium text-base">
									Google
								</Text>
							</Pressable>
							<Pressable
								onPress={() => handleSocialSignup("apple")}
								disabled={isLoading}
								className="flex-1 bg-surface border border-divider rounded-lg p-4 flex-row items-center justify-center active:opacity-70"
								style={{ borderColor: accentColor }}
							>
								<Ionicons
									name="logo-apple"
									size={16}
									color={foregroundColor}
									style={{ marginRight: 8 }}
								/>
								<Text className="text-foreground font-medium text-base">
									Apple
								</Text>
							</Pressable>
						</View>

						{/* Divider */}
						<View className="flex-row items-center mb-6">
							<View
								className="flex-1 h-px"
								style={{ backgroundColor: accentColor }}
							/>
							<Text className="mx-3 text-xs uppercase text-muted-foreground">
								Or continue with email
							</Text>
							<View
								className="flex-1 h-px"
								style={{ backgroundColor: accentColor }}
							/>
						</View>

						{/* Error Message */}
						{errors.root && (
							<View
								className="mb-4 p-3 rounded-lg"
								style={{ backgroundColor: `${dangerColor}20` }}
							>
								<Text className="text-danger text-sm">{errors.root}</Text>
							</View>
						)}

						{/* First Name and Last Name */}
						<View className="flex-row gap-3 mb-4">
							<View className="flex-1">
								<Text className="text-sm font-medium text-foreground mb-2">
									First name
								</Text>
								<TextInput
									className="py-3 px-4 rounded-lg border"
									style={{
										backgroundColor: surfaceColor,
										color: foregroundColor,
										borderColor: errors.firstName ? dangerColor : accentColor,
									}}
									placeholder="John"
									placeholderTextColor={typeof foregroundColor === "string" ? foregroundColor + "80" : foregroundColor}
									value={firstName}
									onChangeText={(text) => {
										setFirstName(text);
										if (errors.firstName) {
											setErrors({ ...errors, firstName: undefined });
										}
									}}
									autoCapitalize="words"
									editable={!isLoading}
								/>
								{errors.firstName && (
									<Text className="text-danger text-sm mt-1">
										{errors.firstName}
									</Text>
								)}
							</View>
							<View className="flex-1">
								<Text className="text-sm font-medium text-foreground mb-2">
									Last name
								</Text>
								<TextInput
									className="py-3 px-4 rounded-lg border"
									style={{
										backgroundColor: surfaceColor,
										color: foregroundColor,
										borderColor: errors.lastName ? dangerColor : accentColor,
									}}
									placeholder="Doe"
									placeholderTextColor={typeof foregroundColor === "string" ? foregroundColor + "80" : foregroundColor}
									value={lastName}
									onChangeText={(text) => {
										setLastName(text);
										if (errors.lastName) {
											setErrors({ ...errors, lastName: undefined });
										}
									}}
									autoCapitalize="words"
									editable={!isLoading}
								/>
								{errors.lastName && (
									<Text className="text-danger text-sm mt-1">
										{errors.lastName}
									</Text>
								)}
							</View>
						</View>

						{/* Username Input */}
						<View className="mb-4">
							<Text className="text-sm font-medium text-foreground mb-2">
								Username
							</Text>
							<View className="relative">
								<TextInput
									className="py-3 px-4 pr-12 rounded-lg border"
									style={{
										backgroundColor: surfaceColor,
										color: foregroundColor,
										borderColor: errors.username ? dangerColor : accentColor,
									}}
									placeholder="johndoe"
									placeholderTextColor={typeof foregroundColor === "string" ? foregroundColor + "80" : foregroundColor}
									value={username}
									onChangeText={(text) => {
										const lowerText = text.toLowerCase();
										setUsername(lowerText);
										if (errors.username) {
											setErrors({ ...errors, username: undefined });
										}
									}}
									autoCapitalize="none"
									autoComplete="username"
									editable={!isLoading}
								/>
								<View className="absolute right-3 top-0 bottom-0 justify-center">
									{username &&
									username.length >= 3 &&
									/^[a-z0-9-_]+$/.test(username) &&
									isUsernameAvailable ? (
										<Ionicons
											name="checkmark-circle"
											size={20}
											color={accentColor}
										/>
									) : null}
									{(errors.username ||
										(username && /[^a-z0-9-_]/.test(username))) && (
										<Ionicons
											name="close-circle"
											size={20}
											color={dangerColor}
										/>
									)}
								</View>
							</View>
							{errors.username && (
								<Text className="text-danger text-sm mt-1">
									{errors.username}
								</Text>
							)}
						</View>

						{/* Email Input */}
						<View className="mb-4">
							<Text className="text-sm font-medium text-foreground mb-2">
								Email
							</Text>
							<TextInput
								className="py-3 px-4 rounded-lg border"
								style={{
									backgroundColor: surfaceColor,
									color: foregroundColor,
									borderColor: errors.email ? dangerColor : accentColor,
								}}
								placeholder="name@example.com"
								placeholderTextColor={typeof foregroundColor === "string" ? foregroundColor + "80" : foregroundColor}
								value={email}
								onChangeText={(text) => {
									setEmail(text);
									if (errors.email) {
										setErrors({ ...errors, email: undefined });
									}
								}}
								keyboardType="email-address"
								autoCapitalize="none"
								autoComplete="email"
								editable={!isLoading}
							/>
							{errors.email && (
								<Text className="text-danger text-sm mt-1">
									{errors.email}
								</Text>
							)}
						</View>

						{/* Password Input */}
						<View className="mb-4">
							<Text className="text-sm font-medium text-foreground mb-2">
								Password
							</Text>
							<View className="relative">
								<TextInput
									className="py-3 px-4 pr-12 rounded-lg border"
									style={{
										backgroundColor: surfaceColor,
										color: foregroundColor,
										borderColor: errors.password ? dangerColor : accentColor,
									}}
									placeholder="Create a password"
									placeholderTextColor={typeof foregroundColor === "string" ? foregroundColor + "80" : foregroundColor}
									value={password}
									onChangeText={(text) => {
										setPassword(text);
										if (errors.password) {
											setErrors({ ...errors, password: undefined });
										}
									}}
									secureTextEntry={!showPassword}
									autoCapitalize="none"
									autoComplete="password-new"
									editable={!isLoading}
								/>
								<Pressable
									onPress={() => setShowPassword(!showPassword)}
									className="absolute right-3 top-0 bottom-0 justify-center"
									style={{ paddingHorizontal: 4 }}
								>
									<Ionicons
										name={showPassword ? "eye-off-outline" : "eye-outline"}
										size={20}
										color={mutedColor}
									/>
								</Pressable>
							</View>
							{errors.password && (
								<Text className="text-danger text-sm mt-1">
									{errors.password}
								</Text>
							)}
						</View>

						{/* Confirm Password Input */}
						<View className="mb-4">
							<Text className="text-sm font-medium text-foreground mb-2">
								Confirm Password
							</Text>
							<View className="relative">
								<TextInput
									className="py-3 px-4 pr-12 rounded-lg border"
									style={{
										backgroundColor: surfaceColor,
										color: foregroundColor,
										borderColor: errors.confirmPassword
											? dangerColor
											: accentColor,
									}}
									placeholder="Confirm your password"
									placeholderTextColor={typeof foregroundColor === "string" ? foregroundColor + "80" : foregroundColor}
									value={confirmPassword}
									onChangeText={(text) => {
										setConfirmPassword(text);
										if (errors.confirmPassword) {
											setErrors({ ...errors, confirmPassword: undefined });
										}
									}}
									secureTextEntry={!showConfirmPassword}
									autoCapitalize="none"
									autoComplete="password-new"
									editable={!isLoading}
								/>
								<Pressable
									onPress={() =>
										setShowConfirmPassword(!showConfirmPassword)
									}
									className="absolute right-3 top-0 bottom-0 justify-center"
									style={{ paddingHorizontal: 4 }}
								>
									<Ionicons
										name={
											showConfirmPassword
												? "eye-off-outline"
												: "eye-outline"
										}
										size={20}
										color={mutedColor}
									/>
								</Pressable>
							</View>
							{errors.confirmPassword && (
								<Text className="text-danger text-sm mt-1">
									{errors.confirmPassword}
								</Text>
							)}
						</View>

						{/* Terms Checkbox */}
						<View className="mb-4">
							<Pressable
								onPress={() => setTermsAccepted(!termsAccepted)}
								className="flex-row items-center"
								disabled={isLoading}
							>
								<View
									className="w-5 h-5 rounded border mr-2 items-center justify-center"
									style={{
										borderColor: termsAccepted
											? accentColor
											: accentColor,
										backgroundColor: termsAccepted
											? accentColor
											: "transparent",
									}}
								>
									{termsAccepted && (
										<Ionicons
											name="checkmark"
											size={14}
											color={foregroundColor}
										/>
									)}
								</View>
								<Text className="text-xs text-foreground flex-1">
									I agree to the{" "}
									<Text className="underline">Terms of Service</Text> and{" "}
									<Text className="underline">Privacy Policy</Text>
								</Text>
							</Pressable>
							{errors.terms && (
								<Text className="text-danger text-sm mt-1">
									{errors.terms}
								</Text>
							)}
						</View>

						{/* Submit Button */}
						<Pressable
							onPress={handleSignup}
							disabled={isLoading}
							className="bg-yellow-500 rounded-lg p-4 flex-row justify-center items-center active:opacity-70 mb-4"
							style={{
								opacity: isLoading ? 0.7 : 1,
							}}
						>
							{isLoading ? (
								<ActivityIndicator size="small" color={foregroundColor} />
							) : (
								<Text className="text-white font-medium text-base">
									Create Account
								</Text>
							)}
						</Pressable>
					</Card>
				</ScrollView>

				{/* Bottom section: Sign in link and copyright */}
				<View
					className="px-6 pb-6"
					style={{ paddingBottom: insets.bottom + 24 }}
				>
					{/* Sign In Link */}
					<View className="flex-row justify-center mb-4">
						<Text className="text-sm text-muted-foreground">
							Already have an account?{" "}
						</Text>
						<Pressable
							onPress={() => {
								router.replace("/login");
							}}
						>
							<Text className="text-sm text-foreground font-medium underline">
								Sign in
							</Text>
						</Pressable>
					</View>

					{/* Copyright Footer */}
					<View className="flex-row justify-between items-center">
						<Text className="text-xs text-muted-foreground">
							Version {VERSION}
						</Text>
						<Text className="text-xs text-muted-foreground">
							© {new Date().getFullYear()} Rackd
						</Text>
					</View>
				</View>
				</View>
			</KeyboardAvoidingView>
		</View>
	);
}

