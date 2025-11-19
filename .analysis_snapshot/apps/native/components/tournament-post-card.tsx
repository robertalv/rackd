import { Text, View, TextInput, Pressable, ActivityIndicator, Alert, ScrollView, Image, Modal } from "react-native";
import { Card } from "heroui-native";
import { useQuery, useMutation } from "convex/react";
import { api } from "@rackd/backend/convex/_generated/api";
import { useState, useRef, useEffect } from "react";
import { useThemeColor } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { PostImage } from "@/components/post-image";
import { CommentItem } from "@/components/comment-item";
import { opacity, withOpacity } from "@/lib/opacity";
import { formatDistanceToNow } from "@/lib/date-utils";
import { formatDate, getGameTypeLabel } from "@/lib/tournament-utils";
import { useRouter } from "expo-router";
import type { Id } from "@rackd/backend/convex/_generated/dataModel";

interface TournamentPostCardProps {
	post: any;
	scrollViewRef?: React.RefObject<ScrollView | null>;
	showCommentsInline?: boolean;
	onCommentPress?: () => void;
}

export function TournamentPostCard({ post, scrollViewRef, showCommentsInline = true, onCommentPress }: TournamentPostCardProps) {
	const [showComments, setShowComments] = useState(false);
	const [commentText, setCommentText] = useState("");
	const [isSubmittingComment, setIsSubmittingComment] = useState(false);
	const [selectedFlyerUrl, setSelectedFlyerUrl] = useState<string | null>(null);
	const commentInputRef = useRef<TextInput>(null);
	const cardRef = useRef<View>(null);

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
		router.push({
			pathname: "/(drawer)/(tabs)/post/[postId]" as any,
			params: { postId: post._id as string, autoFocus: "true" },
		});
	};

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
			setShowComments(true);
		} catch (error) {
			console.error("Error adding comment:", error);
			Alert.alert("Error", "Failed to add comment. Please try again.");
		} finally {
			setIsSubmittingComment(false);
		}
	};

	// Check if tournament was created within 48 hours
	const isNewTournament = post.tournament?._creationTime 
		? Date.now() - post.tournament._creationTime < 48 * 60 * 60 * 1000
		: false;

	const tournament = post.tournament;
	const flyerImageId = post.images && post.images.length > 0 ? post.images[0] : tournament?.flyerUrl;
	
	// Check if flyerImageId is a URL or storage ID
	const isFlyerUrl = flyerImageId && flyerImageId.startsWith("http");
	const flyerImageUrl = useQuery(
		api.files.getFileUrl,
		flyerImageId && !isFlyerUrl ? { storageId: flyerImageId as Id<"_storage"> } : "skip"
	);
	const displayFlyerUrl = isFlyerUrl ? flyerImageId : flyerImageUrl;

	// Format tournament date
	const tournamentDate = tournament?.date 
		? formatDate(tournament.date)
		: null;

	const topLevelComments = comments?.filter((comment: any) => !comment.parentId) || [];
	const likeCount = postStats?.likeCount ?? post.likeCount ?? 0;
	const commentCount = postStats?.commentCount ?? post.commentCount ?? 0;

	const handleFlyerPress = () => {
		if (displayFlyerUrl) {
			setSelectedFlyerUrl(displayFlyerUrl);
		}
	};

	const handleViewTournament = () => {
		router.push({
			pathname: "/(drawer)/(tabs)/tournaments/[tournamentId]" as any,
			params: { tournamentId: post.tournamentId as string },
		});
	};

	const handleViewVenue = () => {
		if (post.venueId) {
			router.push({
				pathname: "/(drawer)/(tabs)/venues/[venueId]" as any,
				params: { venueId: post.venueId as string },
			});
		}
	};

	return (
		<>
			<View ref={cardRef}>
				<Card
					variant="secondary"
					className="mb-1 p-0 border-0 overflow-hidden"
					style={{
						backgroundColor: themeColorBackgroundAccent,
						borderWidth: 2,
						borderColor: accentColor + "33",
					}}
				>
					{/* New Tournament Banner */}
					{isNewTournament && (
						<View
							className="bg-yellow-500"
							style={{
								paddingVertical: 10,
								paddingHorizontal: 16,
								flexDirection: "row",
								alignItems: "center",
								justifyContent: "center",
								gap: 8,
								shadowColor: "#EAB308",
								shadowOffset: { width: 0, height: 2 },
								shadowOpacity: 0.3,
								shadowRadius: 4,
								elevation: 5,
							}}
						>
							<Ionicons name="trophy" size={18} color="#FFFFFF" />
							<Text className="text-xl font-bold tracking-tighter font-mono text-accent">
								New Tournament
							</Text>
						</View>
					)}

					<View className="p-4">
						{/* Header */}
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
								<View className="flex-row items-center gap-2 mb-0.5">
									<Text className="font-semibold text-base" style={{ color: themeColorForeground }}>
										{post.user?.displayName || post.user?.name || "User"}
									</Text>
									<View
										style={{
											backgroundColor: withOpacity(themeColorForeground, opacity.OPACITY_20),
											paddingHorizontal: 8,
											paddingVertical: 2,
											borderRadius: 12,
										}}
									>
										<Text style={{ color: themeColorForeground, fontSize: 10, fontWeight: "600" }}>
											Tournament Update
										</Text>
									</View>
								</View>
								<Text className="text-xs" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
									@{post.user?.username || "user"} • {post._creationTime ? formatDistanceToNow(new Date(post._creationTime)) : "now"}
								</Text>
							</View>
						</View>

						{/* Tournament Card Content */}
						<View className="flex-row gap-3 mb-3">
							{/* Flyer Image on Left */}
							{displayFlyerUrl && (
								<Pressable onPress={handleFlyerPress}>
									<View
										style={{
											width: 120,
											height: 120,
											borderRadius: 8,
											overflow: "hidden",
											borderWidth: 2,
											borderColor: withOpacity(themeColorForeground, opacity.OPACITY_20),
											backgroundColor: themeColorBackground,
										}}
									>
										<Image
											source={{ uri: displayFlyerUrl }}
											style={{
												width: "100%",
												height: "100%",
											}}
											resizeMode="cover"
										/>
									</View>
								</Pressable>
							)}

							{/* Tournament Info on Right */}
							<View className="flex-1 min-w-0">
								{/* Tournament Name */}
								<Pressable onPress={handleViewTournament}>
									<Text 
										className="text-lg font-bold mb-2" 
										style={{ color: themeColorForeground }}
										numberOfLines={2}
									>
										{tournament?.name || "Tournament"}
									</Text>
								</Pressable>

								{/* Tournament Details */}
								<View className="gap-1.5">
									{tournamentDate && (
										<View className="flex-row items-center gap-1.5">
											<Ionicons name="calendar-outline" size={14} color={withOpacity(themeColorForeground, opacity.OPACITY_60)} />
											<Text className="text-xs" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
												{tournamentDate}
											</Text>
										</View>
									)}

									{tournament?.gameType && (
										<View className="flex-row items-center gap-1.5">
											<Ionicons name="trophy-outline" size={14} color={withOpacity(themeColorForeground, opacity.OPACITY_60)} />
											<Text className="text-xs" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
												{getGameTypeLabel(tournament.gameType)}
											</Text>
										</View>
									)}

									{tournament?.venue?.name && (
										<Pressable onPress={handleViewVenue} disabled={!post.venueId}>
											<View className="flex-row items-center gap-1.5">
												<Ionicons name="location-outline" size={14} color={withOpacity(themeColorForeground, opacity.OPACITY_60)} />
												<Text 
													className="text-xs flex-1" 
													style={{ 
														color: post.venueId ? accentColor : withOpacity(themeColorForeground, opacity.OPACITY_60),
													}}
													numberOfLines={1}
												>
													{tournament.venue.name}{tournament.venue.city ? `, ${tournament.venue.city}` : ""}
												</Text>
											</View>
										</Pressable>
									)}

									{tournament?.entryFee !== undefined && tournament.entryFee !== null && (
										<View className="flex-row items-center gap-1.5">
											<Ionicons name="cash-outline" size={14} color={withOpacity(themeColorForeground, opacity.OPACITY_60)} />
											<Text className="text-xs" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
												${tournament.entryFee}
											</Text>
										</View>
									)}

									{tournament?.maxPlayers && (
										<View className="flex-row items-center gap-1.5">
											<Ionicons name="people-outline" size={14} color={withOpacity(themeColorForeground, opacity.OPACITY_60)} />
											<Text className="text-xs" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
												{tournament.registeredCount || 0} / {tournament.maxPlayers} players
											</Text>
										</View>
									)}
								</View>

								{/* View Tournament Button */}
								<Pressable
									onPress={handleViewTournament}
									className="mt-2 flex-row items-center gap-1"
								>
									<Text style={{ color: accentColor, fontSize: 12, fontWeight: "600" }}>
										View Tournament
									</Text>
									<Ionicons name="arrow-forward" size={12} color={accentColor} />
								</Pressable>
							</View>
						</View>

						{/* Actions */}
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
					</View>
				</Card>
			</View>

			{/* Full-size Flyer Modal */}
			<Modal
				visible={selectedFlyerUrl !== null}
				transparent={true}
				animationType="fade"
				onRequestClose={() => setSelectedFlyerUrl(null)}
			>
				<Pressable
					style={{
						flex: 1,
						backgroundColor: "rgba(0, 0, 0, 0.9)",
						justifyContent: "center",
						alignItems: "center",
					}}
					onPress={() => setSelectedFlyerUrl(null)}
				>
					<Pressable
						style={{
							position: "absolute",
							top: 40,
							right: 20,
							zIndex: 1,
						}}
						onPress={() => setSelectedFlyerUrl(null)}
					>
						<View
							style={{
								width: 40,
								height: 40,
								borderRadius: 20,
								backgroundColor: withOpacity(themeColorBackground, opacity.OPACITY_90),
								justifyContent: "center",
								alignItems: "center",
							}}
						>
							<Ionicons name="close" size={24} color={themeColorForeground} />
						</View>
					</Pressable>
					<Pressable
						onPress={(e) => e.stopPropagation()}
						style={{ width: "100%", height: "100%", justifyContent: "center", alignItems: "center" }}
					>
						<ScrollView
							contentContainerStyle={{
								flexGrow: 1,
								justifyContent: "center",
								alignItems: "center",
								padding: 20,
							}}
							maximumZoomScale={3}
							minimumZoomScale={1}
							showsVerticalScrollIndicator={false}
							showsHorizontalScrollIndicator={false}
						>
							{selectedFlyerUrl && (
								<Image
									source={{ uri: selectedFlyerUrl }}
									style={{
										width: "100%",
										maxWidth: "100%",
										resizeMode: "contain",
									}}
								/>
							)}
						</ScrollView>
					</Pressable>
				</Pressable>
			</Modal>
		</>
	);
}

