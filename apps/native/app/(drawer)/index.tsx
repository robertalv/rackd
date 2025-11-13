import { Text, View } from "react-native";
import { Container } from "@/components/container";
import { useQuery } from "convex/react";
import { api } from "@rackd/backend/convex/_generated/api";

export default function Home() {
	return (
		<Container className="p-6">
			<View className="py-4 mb-6">
				<Text className="text-4xl font-bold text-foreground mb-2">
					RACKD
				</Text>
			</View>
		</Container>
	);
}
