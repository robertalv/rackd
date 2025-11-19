import { Text, View, TextInput, Pressable, ActivityIndicator, Alert, ScrollView } from "react-native";
import { Card } from "heroui-native";
import { useQuery, useMutation } from "convex/react";
import { api } from "@rackd/backend/convex/_generated/api";
import { useState, useRef, useEffect } from "react";
import { useThemeColor } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { PostImage } from "@/components/post-image";
import { CommentItem } from "@/components/comment-item";
import { TournamentPostCard } from "@/components/tournament-post-card";
import { opacity, withOpacity } from "@/lib/opacity";
import { formatDistanceToNow } from "@/lib/date-utils";
import { useRouter } from "expo-router";
import type { Id } from "@rackd/backend/convex/_generated/dataModel";

interface PostCardProps {
	post: any;
	scrollViewRef?: React.RefObject<ScrollView | null>;
	showCommentsInline?: boolean;
	onCommentPress?: () => void;
}

export function PostCard({ post, scrollViewRef, showCommentsInline = true, onCommentPress }: PostCardProps) {
	// If this post has a tournament, use the special tournament post card
	if (post.tournamentId && post.tournament) {
		return <TournamentPostCard post={post} scrollViewRef={scrollViewRef} showCommentsInline={showCommentsInline} onCommentPress={onCommentPress} />;
	}
	const [showComments, setShowComments] = useState(false);
	const [commentText, setCommentText] = useState("");
	const [isSubmittingComment, setIsSubmittingComment] = useState(false);
	const commentInputRef = useRef<TextInput>(null);
	const cardRef = useRef<View>(null);
	const commentSectionRef = useRef<View>(null);
	const [commentSectionY, setCommentSectionY] = useState(0);

	const themeColorForeground = useThemeColor("foreground") || "#000000";
	const themeColorBackground = useThemeColor("background") || "#FFFFFF";
	const themeColorBackgroundAccent = useThemeColor("muted") || "#F5F5F5";
	const accentColor = useThemeColor("accent") || "#007AFF";
	const mutedColor = useThemeColor("muted") || "#F5F5F5";
	const primaryColor = useThemeColor("background-inverse") || "#FFFFFF";
	const likedHeartColor = "#ef4444";

	// Validate post data
	if (!post || !post._id) {
		return null;
	}

	// Post interactions
	const isLiked = useQuery(api.posts.isLiked, { postId: post._id });
	const comments = useQuery(api.posts.getComments, { postId: post._id });
	const postStats = useQuery(api.posts.getPostCounterStats, { postId: post._id });

	const likePost = useMutation(api.posts.like);
	const unlikePost = useMutation(api.posts.unlike);
	const addComment = useMutation(api.posts.addComment);

	const router = useRouter();

	const handleLike = async () => {
		try {
			if (isLiked) {
				await unlikePost({ postId: post._id });
			} else {
				await likePost({ postId: post._id });
			}
		} catch (error) {
			console.error("Error liking post:", error);
			Alert.alert("Error", "Failed to like post. Please try again.");
		}
	};

	const handleCommentPress = () => {
		if (onCommentPress) {
			onCommentPress();
			return;
		}
		// Navigate to post detail page when comment icon is clicked
		router.push({
			pathname: "/(drawer)/(tabs)/post/[postId]" as any,
			params: { postId: post._id as string, autoFocus: "true" },
		});
	};

	// Auto-focus when comments are shown
	useEffect(() => {
		if (showComments && showCommentsInline) {
			const timer = setTimeout(() => {
				commentInputRef.current?.focus();
			}, 150);
			return () => clearTimeout(timer);
		}
	}, [showComments, showCommentsInline]);

	const handleSubmitComment = async () => {
		if (!commentText.trim()) return;

		setIsSubmittingComment(true);
		try {
			await addComment({
				postId: post._id,
				content: commentText.trim(),
			});
			setCommentText("");
			setShowComments(true); // Keep comments open after posting
		} catch (error) {
			console.error("Error adding comment:", error);
			Alert.alert("Error", "Failed to add comment. Please try again.");
		} finally {
			setIsSubmittingComment(false);
		}
	};

	// Get top-level comments only
	const topLevelComments = comments?.filter((comment: any) => !comment.parentId) || [];
	const likeCount = postStats?.likeCount ?? post.likeCount ?? 0;
	const commentCount = postStats?.commentCount ?? post.commentCount ?? 0;

	return (
		<View ref={cardRef}>
			<Card
				variant="secondary"
				className="mb-1 p-4 border-0"
				style={{
					backgroundColor: themeColorBackgroundAccent,
					borderWidth: 1,
					borderColor: withOpacity(themeColorForeground, opacity.OPACITY_10),
				}}
			>
				<View className="flex-row items-start mb-3">
					<View
						className="w-12 h-12 rounded-full items-center justify-center mr-3"
						style={{ backgroundColor: primaryColor }}
					>
						<Text className="text-base font-bold" style={{ color: accentColor }}>
							{post.user?.displayName?.charAt(0).toUpperCase() ||
								post.user?.name?.charAt(0).toUpperCase() ||
								post.user?.firstName?.charAt(0).toUpperCase() ||
								"U"}
						</Text>
					</View>
					<View className="flex-1">
						<Text className="font-semibold mb-0.5 text-base" style={{ color: themeColorForeground }}>
							{post.user?.displayName || post.user?.name || "User"}
						</Text>
						<Text className="text-xs" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
							@{post.user?.username || "user"} • {post._creationTime ? formatDistanceToNow(new Date(post._creationTime)) : "now"}
						</Text>
					</View>
				</View>
				
				{post.content && (
					<Text className="mb-4 text-base leading-6" style={{ color: themeColorForeground }}>
						{post.content}
					</Text>
				)}

				{/* Images */}
				{post.images && post.images.length > 0 && (
					<View className="mb-4">
						{post.images.length === 1 ? (
							<PostImage
								storageId={post.images[0] as Id<"_storage">}
								alt="Post image"
								maxSize={680}
								showBackground={true}
								containerHeight={250}
							/>
						) : (
							<View className="flex-row flex-wrap" style={{ marginHorizontal: -4 }}>
								{post.images.slice(0, 4).map((image: string, index: number) => (
									<View key={index} style={{ width: "48%", margin: 4 }}>
										<PostImage
											storageId={image as Id<"_storage">}
											alt={`Post image ${index + 1}`}
											maxSize={340}
											showBackground={false}
											containerHeight={150}
										/>
									</View>
								))}
							</View>
						)}
					</View>
				)}

				<View className="flex-row items-center pt-3 border-t" style={{ borderTopColor: themeColorForeground + "1A" }}>
					<Pressable
						onPress={handleLike}
						className="flex-row items-center mr-6"
						style={({ pressed }) => ({
							opacity: pressed ? 0.6 : 1,
						})}
					>
						<Ionicons
							name={isLiked ? "heart" : "heart-outline"}
							size={18}
							color={isLiked ? likedHeartColor : withOpacity(themeColorForeground, opacity.OPACITY_60)}
						/>
						<Text
							className="text-sm ml-1.5"
							style={{ color: isLiked ? likedHeartColor : withOpacity(themeColorForeground, opacity.OPACITY_60) }}
						>
							{likeCount}
						</Text>
					</Pressable>
					<Pressable
						onPress={handleCommentPress}
						className="flex-row items-center"
						style={({ pressed }) => ({
							opacity: pressed ? 0.6 : 1,
						})}
					>
						<Ionicons
							name={showComments ? "chatbubble" : "chatbubble-outline"}
							size={18}
							color={showComments ? accentColor : themeColorForeground + "99"}
						/>
						<Text
							className="text-sm ml-1.5"
							style={{ color: showComments ? accentColor : themeColorForeground + "99" }}
						>
							{commentCount}
						</Text>
					</Pressable>
				</View>

				{/* Comments Section */}
				{showCommentsInline && showComments && (
					<View 
						ref={commentSectionRef}
						onLayout={(event) => {
							const { y } = event.nativeEvent.layout;
							// Get absolute position by measuring from card
							if (cardRef.current) {
								cardRef.current.measure((x, y, width, height, pageX, pageY) => {
									// Calculate relative Y position in ScrollView
									// This is approximate - we'll use the card's position as reference
									setCommentSectionY(pageY);
								});
							}
						}}
						className="pt-3 border-t mt-3" 
						style={{ borderTopColor: themeColorForeground + "1A" }}
					>
						{/* Comments List */}
						{topLevelComments.length > 0 && (
							<View className="mb-3">
								{topLevelComments.map((comment: any) => (
									<CommentItem key={comment._id} comment={comment} postId={post._id} />
								))}
							</View>
						)}

						{/* Comment Input */}
						<View className="flex-row items-center">
							<TextInput
								ref={commentInputRef}
								value={commentText}
								onChangeText={setCommentText}
								placeholder="Write a comment..."
								placeholderTextColor={mutedColor || withOpacity(themeColorForeground, opacity.OPACITY_60)}
								className="flex-1 px-4 py-3 rounded-lg mr-2"
								style={{
									backgroundColor: mutedColor || withOpacity(themeColorForeground, opacity.OPACITY_10),
									borderWidth: 1,
									borderColor: withOpacity(themeColorForeground, opacity.OPACITY_20),
									color: themeColorForeground,
									fontSize: 16,
									minHeight: 44,
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
				)}
			</Card>
		</View>
	);
}

