import { useState, useEffect } from "react";
import { View, Text, Modal, Pressable, TextInput, ScrollView, StyleSheet, Alert } from "react-native";
import { useQuery, useMutation } from "convex/react";
import { api } from "@rackd/backend/convex/_generated/api";
import type { Id } from "@rackd/backend/convex/_generated/dataModel";
import { useThemeColor } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { opacity, withOpacity } from "@/lib/opacity";

type BackendMatch = {
  _id: Id<"matches">;
  tournamentId: Id<"tournaments">;
  round: number;
  bracketPosition: number;
  player1Id?: Id<"players"> | null;
  player2Id?: Id<"players"> | null;
  winnerId?: Id<"players"> | null;
  player1?: { name: string; _id: Id<"players"> } | null;
  player2?: { name: string; _id: Id<"players"> } | null;
  winner?: { name: string; _id: Id<"players"> } | null;
  status: "pending" | "in_progress" | "completed";
  player1Score: number;
  player2Score: number;
  tableNumber?: number | null;
  bracketType?: "winner" | "loser" | "grand_final" | null;
};

interface MatchDetailModalProps {
  visible: boolean;
  onClose: () => void;
  match: BackendMatch | null;
  tournamentId: Id<"tournaments">;
}

export function MatchDetailModal({ visible, onClose, match, tournamentId }: MatchDetailModalProps) {
  const [status, setStatus] = useState<"pending" | "in_progress" | "completed">("pending");
  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);
  const [player1RaceTo, setPlayer1RaceTo] = useState(0);
  const [player2RaceTo, setPlayer2RaceTo] = useState(0);
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [winnerId, setWinnerId] = useState<Id<"players"> | null>(null);

  const themeColorForeground = useThemeColor("foreground") || "#000000";
  const themeColorBackground = useThemeColor("background") || "#FFFFFF";
  const accentColor = useThemeColor("accent") || "#007AFF";
  const mutedColor = useThemeColor("muted") || "#F5F5F5";
  const dangerColor = useThemeColor("danger") || "#ef4444";

  const tournament = useQuery(api.tournaments.getById, { id: tournamentId });
  const tables = useQuery(api.tournaments.getTables, { tournamentId }) || [];
  const updateMatch = useMutation(api.matches.updateMatch);
  const updateStatus = useMutation(api.matches.updateStatus);
  const assignTable = useMutation(api.matches.assignTable);

  useEffect(() => {
    if (match) {
      setStatus(match.status);
      setPlayer1Score(match.player1Score);
      setPlayer2Score(match.player2Score);
      setSelectedTable(match.tableNumber ?? null);
      setWinnerId(match.winnerId ?? null);
      if (tournament) {
        const isLoserBracket = match.bracketType === "loser";
        const raceTo = isLoserBracket 
          ? tournament.losersRaceTo ?? tournament.winnersRaceTo ?? 0
          : tournament.winnersRaceTo ?? 0;
        setPlayer1RaceTo(raceTo);
        setPlayer2RaceTo(raceTo);
      }
    }
  }, [match, tournament]);

  const handleSave = async () => {
    if (!match) return;

    try {
      const updateData: any = { id: match._id };

      if (status !== undefined) updateData.status = status;
      if (player1Score !== undefined) updateData.player1Score = player1Score;
      if (player2Score !== undefined) updateData.player2Score = player2Score;
      const currentTable = match.tableNumber ?? null;
      if (selectedTable !== currentTable) {
        updateData.tableNumber = selectedTable;
      }
      if (winnerId) {
        updateData.winnerId = winnerId;
      }

      await updateMatch(updateData);
      onClose();
    } catch (error) {
      console.error("Failed to update match:", error);
      Alert.alert("Error", "Failed to update match. Please try again.");
    }
  };

  const handleStartMatch = async () => {
    if (!match) return;
    try {
      await updateStatus({ id: match._id, status: "in_progress" });
      setStatus("in_progress");
    } catch (error) {
      console.error("Failed to start match:", error);
      Alert.alert("Error", "Failed to start match.");
    }
  };

  const handleRemoveTable = async () => {
    if (!match) return;
    try {
      await assignTable({ id: match._id, tableNumber: undefined });
      setSelectedTable(null);
    } catch (error) {
      console.error("Failed to remove table:", error);
      Alert.alert("Error", "Failed to remove table assignment.");
    }
  };

  const getMatchName = () => {
    if (!match) return "";
    const bracketTypeLabel = match.bracketType === "loser" ? "L" : match.bracketType === "grand_final" ? "GF" : "W";
    return `Match ${match.bracketPosition + 1} (${bracketTypeLabel}${match.round}-${match.bracketPosition + 1})`;
  };

  const availableTables = tables.filter((table) => table.status === "OPEN");

  const isLive = status === "in_progress";

  if (!match) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: themeColorBackground }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Ionicons name="checkmark-circle-outline" size={24} color={themeColorForeground} />
              <Text style={[styles.headerTitle, { color: themeColorForeground }]}>
                {getMatchName()}
              </Text>
            </View>
            <View style={styles.headerRight}>
              {isLive && (
                <View style={styles.liveBadge}>
                  <Text style={styles.liveBadgeText}>LIVE</Text>
                </View>
              )}
              <Pressable onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={themeColorForeground} />
              </Pressable>
            </View>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Status Selection */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: themeColorForeground }]}>Match Status</Text>
              <View style={styles.statusButtons}>
                {(["pending", "in_progress", "completed"] as const).map((s) => (
                  <Pressable
                    key={s}
                    onPress={() => {
                      setStatus(s);
                      if (s === "in_progress" && status === "pending") {
                        handleStartMatch();
                      }
                    }}
                    style={[
                      styles.statusButton,
                      {
                        backgroundColor: status === s ? accentColor : withOpacity(themeColorForeground, opacity.OPACITY_10),
                      }
                    ]}
                  >
                    <Text style={[
                      styles.statusButtonText,
                      { color: status === s ? "#FFFFFF" : themeColorForeground }
                    ]}>
                      {s === "pending" ? "Pending" : s === "in_progress" ? "In Progress" : "Completed"}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Player Details */}
            <View style={styles.section}>
              <View style={styles.playerHeader}>
                <Text style={[styles.headerText, { color: themeColorForeground }]}>Player</Text>
                <Text style={[styles.headerText, { color: themeColorForeground }]}>Race To</Text>
                <Text style={[styles.headerText, { color: themeColorForeground }]}>Score</Text>
                <Text style={[styles.headerText, { color: themeColorForeground }]}>Actions</Text>
              </View>

              {/* Player 1 */}
              <View style={styles.playerRow}>
                <Text style={[styles.playerName, { color: themeColorForeground }]}>
                  {match.player1?.name || "TBD"}
                </Text>
                <TextInput
                  style={[styles.numberInput, { backgroundColor: mutedColor, color: themeColorForeground }]}
                  value={String(player1RaceTo)}
                  onChangeText={(text) => setPlayer1RaceTo(parseInt(text) || 0)}
                  keyboardType="numeric"
                />
                <TextInput
                  style={[styles.numberInput, { backgroundColor: mutedColor, color: themeColorForeground }]}
                  value={String(player1Score)}
                  onChangeText={(text) => {
                    const score = parseInt(text) || 0;
                    setPlayer1Score(score);
                    if (score >= player1RaceTo && player1RaceTo > 0) {
                      setWinnerId(match.player1Id ?? null);
                      setStatus("completed");
                    }
                  }}
                  keyboardType="numeric"
                />
                <Pressable
                  onPress={() => {
                    setWinnerId(match.player1Id ?? null);
                    setStatus("completed");
                  }}
                  style={[styles.actionButton, { backgroundColor: accentColor }]}
                >
                  <Text style={styles.actionButtonText}>Win</Text>
                </Pressable>
              </View>

              {/* Player 2 */}
              <View style={styles.playerRow}>
                <Text style={[styles.playerName, { color: themeColorForeground }]}>
                  {match.player2?.name || "TBD"}
                </Text>
                <TextInput
                  style={[styles.numberInput, { backgroundColor: mutedColor, color: themeColorForeground }]}
                  value={String(player2RaceTo)}
                  onChangeText={(text) => setPlayer2RaceTo(parseInt(text) || 0)}
                  keyboardType="numeric"
                />
                <TextInput
                  style={[styles.numberInput, { backgroundColor: mutedColor, color: themeColorForeground }]}
                  value={String(player2Score)}
                  onChangeText={(text) => {
                    const score = parseInt(text) || 0;
                    setPlayer2Score(score);
                    if (score >= player2RaceTo && player2RaceTo > 0) {
                      setWinnerId(match.player2Id ?? null);
                      setStatus("completed");
                    }
                  }}
                  keyboardType="numeric"
                />
                <Pressable
                  onPress={() => {
                    setWinnerId(match.player2Id ?? null);
                    setStatus("completed");
                  }}
                  style={[styles.actionButton, { backgroundColor: accentColor }]}
                >
                  <Text style={styles.actionButtonText}>Win</Text>
                </Pressable>
              </View>
            </View>

            {/* Table Assignment */}
            <View style={styles.section}>
              <View style={styles.labelRow}>
                <Text style={[styles.label, { color: themeColorForeground }]}>Assign open table</Text>
                <Ionicons name="help-circle-outline" size={16} color={withOpacity(themeColorForeground, opacity.OPACITY_60)} />
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tableScroll}>
                {availableTables.map((table) => {
                  const tableNum = table.tableNumber || table.startNumber;
                  return (
                    <Pressable
                      key={table._id}
                      onPress={() => setSelectedTable(tableNum)}
                      style={[
                        styles.tableButton,
                        {
                          backgroundColor: selectedTable === tableNum ? accentColor : mutedColor,
                        }
                      ]}
                    >
                      <Text style={[
                        styles.tableButtonText,
                        { color: selectedTable === tableNum ? "#FFFFFF" : themeColorForeground }
                      ]}>
                        {tableNum}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
              {selectedTable && (
                <Pressable
                  onPress={handleRemoveTable}
                  style={[styles.removeButton, { borderColor: dangerColor }]}
                >
                  <Ionicons name="close-circle" size={20} color={dangerColor} />
                  <Text style={[styles.removeButtonText, { color: dangerColor }]}>
                    Remove table assignment
                  </Text>
                </Pressable>
              )}
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <Pressable
              onPress={onClose}
              style={[styles.footerButton, { borderColor: withOpacity(themeColorForeground, opacity.OPACITY_20) }]}
            >
              <Text style={[styles.footerButtonText, { color: themeColorForeground }]}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={handleSave}
              style={[styles.footerButton, styles.saveButton, { backgroundColor: accentColor }]}
            >
              <Text style={[styles.footerButtonText, { color: "#FFFFFF" }]}>Save</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
    paddingBottom: 32,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  liveBadge: {
    backgroundColor: "#ef4444",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  liveBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 4,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 8,
  },
  statusButtons: {
    flexDirection: "row",
    gap: 8,
  },
  statusButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  statusButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  playerHeader: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
    marginBottom: 8,
  },
  headerText: {
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
  },
  playerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 8,
  },
  playerName: {
    flex: 1,
    fontSize: 14,
  },
  numberInput: {
    width: 60,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    fontSize: 14,
    textAlign: "center",
  },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  tableScroll: {
    marginTop: 8,
  },
  tableButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginRight: 8,
  },
  tableButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  removeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
  },
  removeButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.1)",
  },
  footerButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
  },
  saveButton: {
    borderWidth: 0,
  },
  footerButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});

