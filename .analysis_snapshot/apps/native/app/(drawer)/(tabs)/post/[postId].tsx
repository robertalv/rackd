import { Text, View, ScrollView, ActivityIndicator, Pressable, TextInput, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useMutation } from "convex/react";
import { api } from "@rackd/backend/convex/_generated/api";
import { useState, useRef, useEffect } from "react";
import { useThemeColor } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { PostCard } from "@/components/post-card";
import { CommentItem } from "@/components/comment-item";
import { opacity, withOpacity } from "@/lib/opacity";
import { useRouter, useLocalSearchParams } from "expo-router";
import type { Id } from "@rackd/backend/convex/_generated/dataModel";

export default function PostDetailScreen() {
	const router = useRouter();
	const { postId, autoFocus } = useLocalSearchParams<{ postId: string; autoFocus?: string }>();
	const [commentText, setCommentText] = useState("");
	const [isSubmittingComment, setIsSubmittingComment] = useState(false);
	const [replyingTo, setReplyingTo] = useState<{ commentId: Id<"comments">; username: string } | null>(null);
	const commentInputRef = useRef<TextInput>(null);
	const scrollViewRef = useRef<ScrollView>(null);

	const themeColorForeground = useThemeColor("foreground");
	const themeColorBackground = useThemeColor("background");
	const accentColor = useThemeColor("accent");
	const mutedColor = useThemeColor("muted");
	const primaryColor = useThemeColor("background-inverse") || "#FFFFFF";

	const post = useQuery(api.posts.getPost, { postId: postId as Id<"posts"> });
	const comments = useQuery(api.posts.getComments, { postId: postId as Id<"posts"> });
	const addComment = useMutation(api.posts.addComment);

	// Auto-focus comment input when navigating from comment click
	useEffect(() => {
		if (autoFocus === "true" && commentInputRef.current) {
			// Delay to ensure the screen is fully rendered
			const timer = setTimeout(() => {
				commentInputRef.current?.focus();
			}, 300);
			return () => clearTimeout(timer);
		}
	}, [autoFocus]);

	const handleReplyToComment = (commentId: Id<"comments">, username: string) => {
		setReplyingTo({ commentId, username });
		setTimeout(() => {
			commentInputRef.current?.focus();
		}, 100);
	};

	const handleCancelReply = () => {
		setReplyingTo(null);
		setCommentText("");
	};

	const handleSubmitComment = async () => {
		if (!commentText.trim()) return;

		setIsSubmittingComment(true);
		try {
			await addComment({
				postId: postId as Id<"posts">,
				content: commentText.trim(),
				parentId: replyingTo?.commentId,
			});
			setCommentText("");
			setReplyingTo(null);
		} catch (error) {
			console.error("Error adding comment:", error);
			Alert.alert("Error", "Failed to add comment. Please try again.");
		} finally {
			setIsSubmittingComment(false);
		}
	};

	if (post === undefined) {
		return (
			<SafeAreaView className="flex-1" style={{ backgroundColor: themeColorBackground }}>
				<View className="flex-1 justify-center items-center">
					<ActivityIndicator size="large" color={accentColor} />
					<Text className="mt-4" style={{ color: themeColorForeground }}>
						Loading post...
					</Text>
				</View>
			</SafeAreaView>
		);
	}

	if (!post) {
		return (
			<SafeAreaView className="flex-1" style={{ backgroundColor: themeColorBackground }}>
				<View className="flex-1 justify-center items-center p-6">
					<Text className="text-lg font-semibold mb-2" style={{ color: themeColorForeground }}>
						Post not found
					</Text>
					<Pressable onPress={() => router.back()}>
						<Text style={{ color: accentColor }}>Go back</Text>
					</Pressable>
				</View>
			</SafeAreaView>
		);
	}

	const topLevelComments = comments?.filter((comment: any) => !comment.parentId) || [];

	return (
		<SafeAreaView 
			className="flex-1" 
			style={{ height: "100%", backgroundColor: themeColorBackground }}
			edges={["top"]}
		>
			{/* Header */}
			<View
				className="flex-row items-center justify-between px-4 py-3 border-b"
				style={{
					backgroundColor: themeColorBackground,
					borderBottomColor: withOpacity(themeColorForeground, opacity.OPACITY_10),
				}}
			>
				<View className="flex-row items-center flex-1">
					<Pressable
						onPress={() => router.back()}
						className="mr-3"
						style={({ pressed }) => ({
							opacity: pressed ? 0.6 : 1,
						})}
					>
						<Ionicons name="arrow-back" size={24} color={themeColorForeground} />
					</Pressable>
					<Text className="text-4xl font-bold tracking-tighter font-mono" style={{ color: themeColorForeground }}>
						post
					</Text>
				</View>
				<Pressable
					onPress={() => {
						// TODO: Show report/options menu
						Alert.alert("Options", "Report post, Share, etc.");
					}}
					className="p-2"
					style={({ pressed }) => ({
						opacity: pressed ? 0.6 : 1,
					})}
				>
					<Ionicons name="ellipsis-horizontal" size={24} color={themeColorForeground} />
				</Pressable>
			</View>

			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				style={{ flex: 1 }}
				keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
			>
				<View style={{ flex: 1 }}>
					<ScrollView 
						ref={scrollViewRef}
						style={{ flex: 1 }}
						showsVerticalScrollIndicator={false} 
						keyboardShouldPersistTaps="handled"
						contentContainerStyle={{ paddingBottom: 16 }}
					>
					<View>
						{/* Post Card */}
						<PostCard 
							post={post} 
							scrollViewRef={scrollViewRef}
							showCommentsInline={false}
						/>

						{/* Comments Section */}
						<View className="mb-4 px-4">
							<Text className="text-sm font-normal uppercase mb-3" style={{ color: themeColorForeground }}>
								Comments
							</Text>

							{/* Comments List */}
							{topLevelComments.length > 0 ? (
								<View className="mb-4">
									{topLevelComments.map((comment: any) => (
										<CommentItem 
											key={comment._id} 
											comment={comment} 
											postId={postId as Id<"posts">}
											onReply={handleReplyToComment}
										/>
									))}
								</View>
							) : (
								<View className="py-8 items-center">
									<Ionicons name="chatbubble-outline" size={32} color={withOpacity(themeColorForeground, opacity.OPACITY_40)} />
									<Text className="text-sm mt-2" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
										No comments yet. Be the first to comment!
									</Text>
								</View>
							)}
						</View>
					</View>
					</ScrollView>

					{/* Comment Input - Fixed at bottom above keyboard */}
					<View 
						className="px-4 py-3 border-t"
						style={{ 
							backgroundColor: themeColorBackground,
							borderTopColor: withOpacity(themeColorForeground, opacity.OPACITY_10),
						}}
					>
						{replyingTo && (
							<View className="flex-row items-center justify-between mb-2">
								<Text className="text-xs" style={{ color: accentColor }}>
									Replying to {replyingTo.username}
								</Text>
								<Pressable onPress={handleCancelReply}>
									<Text className="text-xs font-semibold" style={{ color: accentColor }}>
										Cancel
									</Text>
								</Pressable>
							</View>
						)}
						<View className="flex-row items-center">
							<TextInput
								ref={commentInputRef}
								value={commentText}
								onChangeText={setCommentText}
								placeholder={replyingTo ? `Reply to ${replyingTo.username}...` : "Write a comment..."}
								placeholderTextColor={mutedColor || withOpacity(themeColorForeground, opacity.OPACITY_60)}
								className="flex-1 px-4 py-3 rounded-lg mr-2"
								style={{
									backgroundColor: mutedColor || withOpacity(themeColorForeground, opacity.OPACITY_10),
									borderWidth: 1,
									borderColor: withOpacity(themeColorForeground, opacity.OPACITY_20),
									color: themeColorForeground,
									fontSize: 16,
									minHeight: 44,
									maxHeight: 100,
								}}
								multiline
								maxLength={500}
								textAlignVertical="top"
							/>
							<Pressable
								onPress={handleSubmitComment}
								disabled={!commentText.trim() || isSubmittingComment}
								className="px-4 py-3 rounded-lg"
								style={{
									backgroundColor: commentText.trim() && !isSubmittingComment ? accentColor : withOpacity(themeColorForeground, opacity.OPACITY_20),
									opacity: commentText.trim() && !isSubmittingComment ? 1 : 0.6,
									minHeight: 44,
									justifyContent: "center",
								}}
							>
								{isSubmittingComment ? (
									<ActivityIndicator size="small" color={themeColorBackground} />
								) : (
									<Ionicons name="send" size={20} color={themeColorBackground} />
								)}
							</Pressable>
						</View>
					</View>
				</View>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}

