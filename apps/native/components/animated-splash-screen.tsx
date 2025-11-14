import React, { useEffect, useRef } from "react";
import { View, Image, Animated, StyleSheet, StatusBar } from "react-native";

interface AnimatedSplashScreenProps {
	onAnimationComplete: () => void;
}

export const AnimatedSplashScreen = React.memo(function AnimatedSplashScreen({
	onAnimationComplete,
}: AnimatedSplashScreenProps) {
	const scaleAnim = useRef(new Animated.Value(0.5)).current;
	const opacityAnim = useRef(new Animated.Value(0)).current;
	const fadeOutAnim = useRef(new Animated.Value(1)).current;
	const hasStartedRef = useRef(false);
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const onCompleteRef = useRef(onAnimationComplete);

	// Keep callback ref up to date
	useEffect(() => {
		onCompleteRef.current = onAnimationComplete;
	}, [onAnimationComplete]);

	useEffect(() => {
		// Prevent double execution - this is critical
		if (hasStartedRef.current) {
			return;
		}
		hasStartedRef.current = true;

		// Start with zoom in and fade in
		Animated.parallel([
			Animated.spring(scaleAnim, {
				toValue: 1,
				tension: 50,
				friction: 7,
				useNativeDriver: true,
			}),
			Animated.timing(opacityAnim, {
				toValue: 1,
				duration: 600,
				useNativeDriver: true,
			}),
		]).start(() => {
			// After zoom in completes, wait a bit then fade out
			timeoutRef.current = setTimeout(() => {
				Animated.parallel([
					Animated.timing(fadeOutAnim, {
						toValue: 0,
						duration: 500,
						useNativeDriver: true,
					}),
					Animated.timing(scaleAnim, {
						toValue: 1.1,
						duration: 500,
						useNativeDriver: true,
					}),
				]).start(() => {
					onCompleteRef.current();
				});
			}, 800); // Wait 800ms before starting fade out
		});

		// Cleanup function
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []); // Empty deps - animation should only run once on mount

	return (
		<Animated.View
			style={[
				styles.container,
				{
					opacity: fadeOutAnim,
				},
			]}
		>
			<StatusBar hidden={true} />
			<Animated.View
				style={[
					styles.logoContainer,
					{
						transform: [{ scale: scaleAnim }],
						opacity: opacityAnim,
					},
				]}
			>
				<Image
					source={require("../assets/images/splash-icon.png")}
					style={styles.logo}
					resizeMode="contain"
				/>
			</Animated.View>
		</Animated.View>
	);
});

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#000000",
		justifyContent: "center",
		alignItems: "center",
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		zIndex: 9999,
	},
	logoContainer: {
		width: 200,
		height: 200,
		justifyContent: "center",
		alignItems: "center",
	},
	logo: {
		width: "100%",
		height: "100%",
	},
});

