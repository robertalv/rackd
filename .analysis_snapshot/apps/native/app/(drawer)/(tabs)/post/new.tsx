import { SafeAreaView } from "react-native-safe-area-context";
import { PostComposer } from "@/components/post-composer";
import { useRouter } from "expo-router";
import { useThemeColor } from "heroui-native";

export default function NewPostScreen() {
	const router = useRouter();
    const themeColorBackground = useThemeColor("background");
	const handlePostCreated = () => {
		router.back();
	};

	const handleCancel = () => {
		router.back();
	};

	return (
		<SafeAreaView className="flex-1" style={{ height: "100%", backgroundColor: themeColorBackground }} edges={["top"]}>
			<PostComposer onPostCreated={handlePostCreated} onCancel={handleCancel} />
		</SafeAreaView>
	);
}

