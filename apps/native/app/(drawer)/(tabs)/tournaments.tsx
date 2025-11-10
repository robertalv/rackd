import { Container } from "@/components/container";
import { Text, View } from "react-native";
import { Card } from "heroui-native";
import { useThemeColor } from "heroui-native";

export default function TournamentsScreen() {
	const themeColorForeground = useThemeColor("foreground");

	return (
		<Container className="p-6">
			<View className="flex-1 justify-center items-center">
				<Card variant="secondary" className="p-8 items-center">
					<Card.Title className="text-3xl mb-2" style={{ color: themeColorForeground }}>
						Tournaments
					</Card.Title>
					<Text className="text-center mt-4" style={{ color: themeColorForeground + "80" }}>
						Tournament listings coming soon...
					</Text>
				</Card>
			</View>
		</Container>
	);
}

