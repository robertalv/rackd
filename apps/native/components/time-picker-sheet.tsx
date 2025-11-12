import { useState, useRef, useMemo, useCallback } from "react";
import { View, Text, Pressable, Platform } from "react-native";
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView } from "@gorhom/bottom-sheet";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useThemeColor } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { opacity, withOpacity } from "@/lib/opacity";

interface TimePickerSheetProps {
	value: string; // Format: "HH:MM"
	onChange: (time: string) => void;
}

export function TimePickerSheet({ value, onChange }: TimePickerSheetProps) {
	const bottomSheetModalRef = useRef<BottomSheetModal>(null);
	const themeColorForeground = useThemeColor("foreground") || "#000000";
	const themeColorBackground = useThemeColor("background") || "#FFFFFF";
	const accentColor = useThemeColor("accent") || "#007AFF";

	// Parse time string to Date object
	const parseTime = useCallback((timeStr: string): Date => {
		const [hours, minutes] = timeStr.split(":").map(Number);
		const date = new Date();
		date.setHours(hours || 0, minutes || 0, 0, 0);
		return date;
	}, []);

	const [tempTime, setTempTime] = useState<Date>(parseTime(value || "09:00"));
	const [showPicker, setShowPicker] = useState(false);

	const snapPoints = useMemo(() => ["40%"], []);

	const renderBackdrop = useCallback(
		(props: any) => (
			<BottomSheetBackdrop
				{...props}
				disappearsOnIndex={-1}
				appearsOnIndex={0}
				opacity={0.5}
			/>
		),
		[]
	);

	const handleOpen = useCallback(() => {
		if (Platform.OS === "android") {
			setShowPicker(true);
		} else {
			setTempTime(parseTime(value || "09:00"));
			bottomSheetModalRef.current?.present();
			setShowPicker(true);
		}
	}, [value, parseTime]);

	const handleConfirm = useCallback(() => {
		const hours = tempTime.getHours().toString().padStart(2, "0");
		const minutes = tempTime.getMinutes().toString().padStart(2, "0");
		onChange(`${hours}:${minutes}`);
		bottomSheetModalRef.current?.dismiss();
		setShowPicker(false);
	}, [tempTime, onChange]);

	const handleCancel = useCallback(() => {
		bottomSheetModalRef.current?.dismiss();
		setShowPicker(false);
	}, []);

	const handleTimeChange = useCallback((event: any, selectedTime?: Date) => {
		if (Platform.OS === "android") {
			setShowPicker(false);
			if (event.type === "set" && selectedTime) {
				const hours = selectedTime.getHours().toString().padStart(2, "0");
				const minutes = selectedTime.getMinutes().toString().padStart(2, "0");
				onChange(`${hours}:${minutes}`);
			}
		} else {
			if (selectedTime) {
				setTempTime(selectedTime);
			}
		}
	}, [onChange]);

	return (
		<>
			<Pressable
				onPress={handleOpen}
				className="w-24 px-4 py-3 rounded-lg border flex-row items-center justify-between"
				style={{
					backgroundColor: withOpacity(themeColorForeground, opacity.OPACITY_10),
					borderColor: withOpacity(themeColorForeground, opacity.OPACITY_20),
				}}
			>
				<Text
					style={{
						color: value ? themeColorForeground : withOpacity(themeColorForeground, opacity.OPACITY_40),
					}}
				>
					{value || "09:00"}
				</Text>
				<Ionicons name="time-outline" size={20} color={withOpacity(themeColorForeground, opacity.OPACITY_60)} />
			</Pressable>

			{Platform.OS === "android" && showPicker && (
				<DateTimePicker
					value={tempTime}
					mode="time"
					display="default"
					is24Hour={false}
					onChange={handleTimeChange}
				/>
			)}

			<BottomSheetModal
				ref={bottomSheetModalRef}
				snapPoints={snapPoints}
				enablePanDownToClose
				backgroundStyle={{ backgroundColor: themeColorBackground }}
				handleIndicatorStyle={{ backgroundColor: withOpacity(themeColorForeground, opacity.OPACITY_20) }}
				backdropComponent={renderBackdrop}
				onDismiss={() => setShowPicker(false)}
			>
				<BottomSheetView>
					<View className="px-4 pb-4">
						{/* Header */}
						<View className="flex-row items-center justify-between mb-4">
							<Text className="text-lg font-semibold" style={{ color: themeColorForeground }}>
								Select Time
							</Text>
							<Pressable onPress={handleCancel}>
								<Ionicons name="close" size={24} color={themeColorForeground} />
							</Pressable>
						</View>

						{/* Time Picker */}
						{Platform.OS === "ios" && (
							<DateTimePicker
								value={tempTime}
								mode="time"
								display="spinner"
								is24Hour={false}
								onChange={handleTimeChange}
								style={{ backgroundColor: themeColorBackground }}
							/>
						)}


						{/* Confirm Button */}
						{Platform.OS === "ios" && (
							<Pressable
								onPress={handleConfirm}
								className="px-6 py-4 rounded-lg mt-4"
								style={{ backgroundColor: accentColor }}
							>
								<Text className="text-center font-semibold" style={{ color: "#FFFFFF" }}>
									Confirm
								</Text>
							</Pressable>
						)}
					</View>
				</BottomSheetView>
			</BottomSheetModal>
		</>
	);
}

