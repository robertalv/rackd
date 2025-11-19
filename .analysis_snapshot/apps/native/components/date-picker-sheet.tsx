import { useState, useRef, useMemo, useCallback } from "react";
import { View, Text, Pressable, Platform } from "react-native";
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView } from "@gorhom/bottom-sheet";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useThemeColor } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { opacity, withOpacity } from "@/lib/opacity";

interface DatePickerSheetProps {
	value: Date | null;
	onChange: (date: Date | null) => void;
	minimumDate?: Date;
	maximumDate?: Date;
}

export function DatePickerSheet({
	value,
	onChange,
	minimumDate,
	maximumDate,
}: DatePickerSheetProps) {
	const bottomSheetModalRef = useRef<BottomSheetModal>(null);
	const themeColorForeground = useThemeColor("foreground") || "#000000";
	const themeColorBackground = useThemeColor("background") || "#FFFFFF";
	const accentColor = useThemeColor("accent") || "#007AFF";

	const [tempDate, setTempDate] = useState<Date>(value || new Date());
	const [showPicker, setShowPicker] = useState(false);

	const snapPoints = useMemo(() => ["50%"], []);

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
			setTempDate(value || new Date());
			bottomSheetModalRef.current?.present();
			setShowPicker(true);
		}
	}, [value]);

	const handleConfirm = useCallback(() => {
		onChange(tempDate);
		bottomSheetModalRef.current?.dismiss();
		setShowPicker(false);
	}, [tempDate, onChange]);

	const handleCancel = useCallback(() => {
		bottomSheetModalRef.current?.dismiss();
		setShowPicker(false);
	}, []);

	const handleDateChange = useCallback((event: any, selectedDate?: Date) => {
		if (Platform.OS === "android") {
			setShowPicker(false);
			if (event.type === "set" && selectedDate) {
				onChange(selectedDate);
			}
		} else {
			if (selectedDate) {
				setTempDate(selectedDate);
			}
		}
	}, [onChange]);

	return (
		<>
			<Pressable
				onPress={handleOpen}
				className="flex-1 px-4 py-3 rounded-lg border flex-row items-center justify-between"
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
					{value ? value.toISOString().split("T")[0] : "YYYY-MM-DD"}
				</Text>
				<Ionicons name="calendar-outline" size={20} color={withOpacity(themeColorForeground, opacity.OPACITY_60)} />
			</Pressable>

			{Platform.OS === "android" && showPicker && (
				<DateTimePicker
					value={value || new Date()}
					mode="date"
					display="default"
					onChange={handleDateChange}
					minimumDate={minimumDate}
					maximumDate={maximumDate}
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
								Select Date
							</Text>
							<Pressable onPress={handleCancel}>
								<Ionicons name="close" size={24} color={themeColorForeground} />
							</Pressable>
						</View>

						{/* Date Picker */}
						{Platform.OS === "ios" && (
							<DateTimePicker
								value={tempDate}
								mode="date"
								display="spinner"
								onChange={handleDateChange}
								minimumDate={minimumDate}
								maximumDate={maximumDate}
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

