import { Text, View, Pressable, TextInput, ActivityIndicator, Alert } from "react-native";
import { useThemeColor } from "heroui-native";
import { useRouter } from "expo-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "@rackd/backend/convex/_generated/api";
import { useState } from "react";
import { opacity, withOpacity } from "@/lib/opacity";
import { formatDistanceToNow } from "@/lib/date-utils";
import type { Id } from "@rackd/backend/convex/_generated/dataModel";

interface CommentItemProps {
	comment: any;
	postId: Id<"posts">;
	level?: number;
	mainCommentId?: Id<"comments">;
	onPress?: () => void;
	onReply?: (commentId: Id<"comments">, username: string) => void;
}

export function CommentItem({ comment, postId, level = 0, mainCommentId, onPress, onReply }: CommentItemProps) {
	const router = useRouter();
	const themeColorForeground = useThemeColor("foreground") || "#000000";
	const accentColor = useThemeColor("accent") || "#007AFF";
	const mutedColor = useThemeColor("muted") || "#F5F5F5";
	const primaryColor = useThemeColor("background-inverse") || "#FFFFFF";
	const themeColorBackground = useThemeColor("background") || "#FFFFFF";

	const [showReplyInput, setShowReplyInput] = useState(false);
	const [showReplies, setShowReplies] = useState(false);
	const [replyText, setReplyText] = useState("");
	const [isSubmittingReply, setIsSubmittingReply] = useState(false);

	// Get replies to this comment (only for top-level comments)
	const allComments = useQuery(api.posts.getComments, { postId });
	const commentReplies = level === 0 ? (allComments?.filter((reply: any) => reply.parentId === comment._id) || []) : [];

	// Comment interactions
	const isLiked = useQuery(api.posts.isCommentLiked, { commentId: comment._id });
	const commentStats = useQuery(api.posts.getCommentCounterStats, { commentId: comment._id });
	const likeComment = useMutation(api.posts.likeComment);
	const unlikeComment = useMutation(api.posts.unlikeComment);
	const addComment = useMutation(api.posts.addComment);

	// Validate comment data
	if (!comment || !comment._id) {
		return null;
	}

	const handlePress = () => {
		if (onPress) {
			onPress();
			return;
		}
		// Navigate to post detail screen when comment is clicked, with autoFocus param
		console.log("Comment clicked, navigating to post:", postId);
		if (!postId) {
			console.error("PostId is missing!");
			return;
		}
		router.push({
			pathname: "/(drawer)/(tabs)/post/[postId]" as any,
			params: { postId: postId as string, autoFocus: "true" },
		});
	};

	const handleReplyClick = () => {
		if (onReply) {
			onReply(comment._id, comment.user?.displayName || comment.user?.name || "User");
		} else {
			setShowReplyInput(true);
			if (level === 0 && commentReplies.length > 0) {
				setShowReplies(true);
			}
		}
	};

	const handleLike = async () => {
		try {
			if (isLiked) {
				await unlikeComment({ commentId: comment._id });
			} else {
				await likeComment({ commentId: comment._id });
			}
		} catch (error) {
			console.error("Error liking comment:", error);
			Alert.alert("Error", "Failed to like comment. Please try again.");
		}
	};

	const handleSubmitReply = async () => {
		if (!replyText.trim()) return;

		setIsSubmittingReply(true);
		try {
			await addComment({
				postId,
				content: replyText.trim(),
				parentId: level === 0 ? comment._id : mainCommentId || comment._id,
			});
			setReplyText("");
			setShowReplyInput(false);
			if (level === 0) {
				setShowReplies(true);
			}
		} catch (error) {
			console.error("Error adding reply:", error);
			Alert.alert("Error", "Failed to add reply. Please try again.");
		} finally {
			setIsSubmittingReply(false);
		}
	};

	const likeCount = commentStats?.likeCount ?? comment.likeCount ?? 0;

	return (
		<View style={{ marginLeft: level > 0 ? 16 : 0 }}>
			<View className="mb-3 pb-3 border-b" style={{ borderBottomColor: withOpacity(themeColorForeground, opacity.OPACITY_10) }}>
				<View className="flex-row items-start mb-1">
					<View
						className="w-8 h-8 rounded-full items-center justify-center mr-2"
						style={{ backgroundColor: primaryColor }}
					>
						<Text className="text-xs font-bold" style={{ color: accentColor }}>
							{comment.user?.displayName?.charAt(0).toUpperCase() ||
								comment.user?.name?.charAt(0).toUpperCase() ||
								"U"}
						</Text>
					</View>
					<View className="flex-1">
						<Text className="text-sm font-semibold mb-0.5" style={{ color: themeColorForeground }}>
							{comment.user?.displayName || comment.user?.name || "User"}
						</Text>
						<Text className="text-sm leading-5" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_90) }}>
							{comment.content}
						</Text>
						<View className="flex-row items-center mt-1">
							<Text className="text-xs mr-3" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
								{formatDistanceToNow(new Date(comment._creationTime))}
							</Text>
							<Pressable
								onPress={handleLike}
								className="mr-3"
								style={({ pressed }) => ({
									opacity: pressed ? 0.6 : 1,
								})}
							>
								<Text className="text-xs font-semibold" style={{ color: isLiked ? accentColor : withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
									Like
								</Text>
							</Pressable>
							<Pressable
								onPress={handleReplyClick}
								style={({ pressed }) => ({
									opacity: pressed ? 0.6 : 1,
								})}
							>
								<Text className="text-xs font-semibold" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
									Reply
								</Text>
							</Pressable>
							{likeCount > 0 && (
								<View className="flex-row items-center ml-3">
									<Text className="text-xs" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
										{likeCount}
									</Text>
								</View>
							)}
						</View>
					</View>
				</View>

				{/* Reply count and toggle for top-level comments */}
				{level === 0 && commentReplies.length > 0 && (
					<View className="ml-10 mt-2">
						<Pressable
							onPress={() => setShowReplies(!showReplies)}
							style={({ pressed }) => ({
								opacity: pressed ? 0.6 : 1,
							})}
						>
							<Text className="text-xs font-semibold" style={{ color: accentColor }}>
								{showReplies ? 'Hide replies' : `View ${commentReplies.length} ${commentReplies.length === 1 ? 'reply' : 'replies'}`}
							</Text>
						</Pressable>
					</View>
				)}

				{/* Reply input */}
				{showReplyInput && !onReply && (
					<View className="ml-10 mt-3">
						<View className="flex-row items-center mb-2">
							<TextInput
								value={replyText}
								onChangeText={setReplyText}
								placeholder={`Reply to ${comment.user?.displayName || comment.user?.name || "User"}...`}
								placeholderTextColor={mutedColor || withOpacity(themeColorForeground, opacity.OPACITY_60)}
								className="flex-1 px-3 py-2 rounded-lg mr-2"
								style={{
									backgroundColor: mutedColor || withOpacity(themeColorForeground, opacity.OPACITY_10),
									borderWidth: 1,
									borderColor: withOpacity(themeColorForeground, opacity.OPACITY_20),
									color: themeColorForeground,
									fontSize: 14,
									minHeight: 36,
									maxHeight: 80,
								}}
								multiline
								maxLength={500}
								textAlignVertical="top"
								autoFocus
							/>
							<Pressable
								onPress={handleSubmitReply}
								disabled={!replyText.trim() || isSubmittingReply}
								className="px-3 py-2 rounded-lg"
								style={{
									backgroundColor: replyText.trim() && !isSubmittingReply ? accentColor : withOpacity(themeColorForeground, opacity.OPACITY_20),
									opacity: replyText.trim() && !isSubmittingReply ? 1 : 0.6,
									minHeight: 36,
									justifyContent: "center",
								}}
							>
								{isSubmittingReply ? (
									<ActivityIndicator size="small" color={themeColorBackground} />
								) : (
									<Text style={{ color: themeColorBackground, fontSize: 12, fontWeight: "600" }}>Send</Text>
								)}
							</Pressable>
						</View>
						<Pressable
							onPress={() => {
								setShowReplyInput(false);
								setReplyText("");
							}}
							className="ml-10"
						>
							<Text className="text-xs" style={{ color: accentColor }}>
								Cancel
							</Text>
						</Pressable>
					</View>
				)}

				{/* Show nested replies */}
				{level === 0 && showReplies && commentReplies.length > 0 && (
					<View className="mt-3 ml-4" style={{ borderLeftWidth: 2, borderLeftColor: withOpacity(themeColorForeground, opacity.OPACITY_10), paddingLeft: 12 }}>
						{commentReplies.map((reply: any) => (
							<CommentItem
								key={reply._id}
								comment={reply}
								postId={postId}
								level={1}
								mainCommentId={comment._id}
								onReply={onReply}
							/>
						))}
					</View>
				)}
			</View>
		</View>
	);
}
