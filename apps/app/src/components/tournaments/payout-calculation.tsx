import { useQuery, useAction, useMutation } from "convex/react";
import { api } from "@rackd/backend/convex/_generated/api";
import type { Id } from "@rackd/backend/convex/_generated/dataModel";
import { Button } from "@rackd/ui/components/button";
import { Input } from "@rackd/ui/components/input";
import { Label } from "@rackd/ui/components/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@rackd/ui/components/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@rackd/ui/components/table";
import { useState, useEffect } from "react";
import { DollarSign, Sparkles, Calculator, Loader2, Edit2, Plus, Trash2, Save, AlertCircle } from "lucide-react";
import { Badge } from "@rackd/ui/components/badge";
import { Alert, AlertDescription } from "@rackd/ui/components/alert";

type Props = {
  tournamentId: Id<"tournaments">;
};

export function PayoutCalculation({ tournamentId }: Props) {
  const [houseFeePerPlayer, setHouseFeePerPlayer] = useState<number>(0);
  const [payoutPlaces, setPayoutPlaces] = useState<number>(3);
  const [isManualMode, setIsManualMode] = useState<boolean>(false);
  const [editingPayouts, setEditingPayouts] = useState<Array<{ place: number; amount: number; percentage: number }>>([]);

  const payoutData = useQuery(api.tournaments.getPayoutCalculation, { tournamentId });
  const savedPayoutStructure = useQuery(api.tournaments.getPayoutStructure, { tournamentId });
  const generatePayouts = useAction(api.tournaments.generateOptimalPayouts);
  const savePayoutStructure = useMutation(api.tournaments.savePayoutStructure);
  
  const [payouts, setPayouts] = useState<{
    totalCollected: number;
    houseFee: number;
    potAmount: number;
    paidPlayers: number;
    payouts: Array<{ place: number; amount: number; percentage: number }>;
    rationale: string;
  } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load saved payout structure on mount
  useEffect(() => {
    if (!savedPayoutStructure) return;
    
    if (savedPayoutStructure.payoutStructure && !payouts) {
      setPayouts({
        ...savedPayoutStructure.payoutStructure,
        rationale: savedPayoutStructure.payoutStructure.rationale || "Saved payout structure",
      });
      setEditingPayouts(savedPayoutStructure.payoutStructure.payouts.map(p => ({ ...p })));
    }
    if (savedPayoutStructure.houseFeePerPlayer !== null && savedPayoutStructure.houseFeePerPlayer !== undefined) {
      setHouseFeePerPlayer(savedPayoutStructure.houseFeePerPlayer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedPayoutStructure]);

  const handleGeneratePayouts = async () => {
    setIsGenerating(true);
    setIsManualMode(false);
    try {
      const result = await generatePayouts({
        tournamentId,
        houseFeePerPlayer,
        payoutPlaces,
      });
      setPayouts(result);
      setEditingPayouts(result.payouts.map(p => ({ ...p })));
      
      // Auto-save after generation
      await handleSavePayoutStructure(result);
    } catch (error) {
      console.error("Failed to generate payouts:", error);
      alert("Failed to generate payouts. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSavePayoutStructure = async (payoutsToSave?: typeof payouts) => {
    const structureToSave = payoutsToSave || payouts;
    if (!structureToSave) return;

    setIsSaving(true);
    try {
      await savePayoutStructure({
        tournamentId,
        houseFeePerPlayer,
        payoutStructure: structureToSave,
      });
      // Show success feedback
      if (!payoutsToSave) {
        setIsManualMode(false);
      }
    } catch (error: any) {
      console.error("Failed to save payout structure:", error);
      alert(error?.message || "Failed to save payout structure. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleManualMode = () => {
    if (!payoutData) return;
    
    setIsManualMode(true);
    if (!payouts) {
      // Initialize with empty payouts if none exist
      const { totalCollected, paidPlayers } = payoutData;
      const potAmount = (totalCollected - (houseFeePerPlayer * paidPlayers));
      setEditingPayouts([{ place: 1, amount: 0, percentage: 0 }]);
      setPayouts({
        totalCollected,
        houseFee: houseFeePerPlayer * paidPlayers,
        potAmount,
        paidPlayers,
        payouts: [{ place: 1, amount: 0, percentage: 0 }],
        rationale: "Manual payout structure",
      });
    } else {
      setEditingPayouts(payouts.payouts.map(p => ({ ...p })));
    }
  };

  const handleAddPayoutPlace = () => {
    const newPlace = editingPayouts.length + 1;
    setEditingPayouts([...editingPayouts, { place: newPlace, amount: 0, percentage: 0 }]);
  };

  const handleRemovePayoutPlace = (index: number) => {
    const newPayouts = editingPayouts.filter((_, i) => i !== index);
    // Re-number places
    const renumbered = newPayouts.map((p, i) => ({ ...p, place: i + 1 }));
    setEditingPayouts(renumbered);
  };

  const handleUpdatePayoutAmount = (index: number, amount: number) => {
    const newPayouts = [...editingPayouts];
    newPayouts[index] = {
      ...newPayouts[index],
      amount,
      percentage: payouts ? (amount / payouts.potAmount) * 100 : 0,
    };
    setEditingPayouts(newPayouts);
  };

  const handleSaveManualPayouts = async () => {
    if (!payouts) return;
    
    const totalPayouts = editingPayouts.reduce((sum, p) => sum + p.amount, 0);
    const difference = Math.abs(totalPayouts - payouts.potAmount);
    
    if (difference > 0.01) {
      alert(`Total payouts ($${totalPayouts.toFixed(2)}) must equal pot amount ($${payouts.potAmount.toFixed(2)}). Difference: $${difference.toFixed(2)}`);
      return;
    }

    // Update payouts with manual entries
    const updatedPayouts = {
      ...payouts,
      payouts: editingPayouts.map(p => ({
        ...p,
        percentage: (p.amount / payouts.potAmount) * 100,
      })),
      rationale: "Manual payout structure",
    };
    setPayouts(updatedPayouts);
    
    // Save to database
    await handleSavePayoutStructure(updatedPayouts);
  };

  if (!payoutData) {
    return <div>Loading...</div>;
  }

  const { entryFee, totalPlayers, paidPlayers, unpaidPlayers, totalCollected } = payoutData;

  return (
    <div className="space-y-6 h-full">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Payment Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-muted-foreground">Entry Fee</Label>
              <div className="text-2xl font-bold">${entryFee.toFixed(2)}</div>
            </div>
            <div>
              <Label className="text-muted-foreground">Total Players</Label>
              <div className="text-2xl font-bold">{totalPlayers}</div>
            </div>
            <div>
              <Label className="text-muted-foreground">Paid Players</Label>
              <div className="text-2xl font-bold text-green-600">{paidPlayers}</div>
            </div>
            <div>
              <Label className="text-muted-foreground">Unpaid Players</Label>
              <div className="text-2xl font-bold text-orange-600">{unpaidPlayers}</div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <Label className="text-lg">Total Collected</Label>
              <div className="text-3xl font-bold text-green-600">
                ${totalCollected.toFixed(2)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payout Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Payout Configuration
          </CardTitle>
          <CardDescription>
            Configure house fees and payout structure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="houseFeePerPlayer">House Fee Per Player/Team</Label>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-muted-foreground">$</span>
                <Input
                  id="houseFeePerPlayer"
                  type="number"
                  min="0"
                  step="0.01"
                  value={houseFeePerPlayer}
                  onChange={(e) => setHouseFeePerPlayer(parseFloat(e.target.value) || 0)}
                  className="max-w-[200px]"
                />
                {houseFeePerPlayer > 0 && paidPlayers > 0 && (
                  <span className="text-sm text-muted-foreground">
                    = ${(houseFeePerPlayer * paidPlayers).toFixed(2)} total ({paidPlayers} players)
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                This amount will be charged per paid player/team
              </p>
            </div>

            <div>
              <Label htmlFor="payoutPlaces">Number of Payout Places</Label>
              <Input
                id="payoutPlaces"
                type="number"
                min="1"
                max={paidPlayers}
                value={payoutPlaces}
                onChange={(e) => setPayoutPlaces(parseInt(e.target.value) || 1)}
                className="max-w-[200px] mt-1"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Maximum: {paidPlayers} (based on paid players)
              </p>
            </div>

            <div className="pt-4 border-t space-y-2">
              <div className="flex gap-2">
                <Button
                  onClick={handleGeneratePayouts}
                  disabled={isGenerating || totalCollected === 0}
                  className="flex-1"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Optimal Payouts (AI)
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleManualMode}
                  disabled={totalCollected === 0}
                  variant="outline"
                  className="flex-1"
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  {payouts ? "Update Payout" : "Manual Entry"}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payout Results */}
      {payouts && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Payout Structure
              </CardTitle>
              {isManualMode && (
                <div className="flex gap-2">
                  <Button
                    onClick={handleAddPayoutPlace}
                    size="sm"
                    variant="outline"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Place
                  </Button>
                  <Button
                    onClick={handleSaveManualPayouts}
                    size="sm"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-1" />
                        Save
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
            {payouts.rationale && !isManualMode && (
              <CardDescription>{payouts.rationale}</CardDescription>
            )}
              {isManualMode && (
                <CardDescription>Edit payout amounts manually. Total must equal pot amount.</CardDescription>
              )}
              {!isManualMode && payouts && (
                <div className="flex items-center gap-2 mt-2">
                  <Button
                    onClick={() => handleSavePayoutStructure()}
                    size="sm"
                    variant="outline"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-3 w-3 mr-1" />
                        Update Saved Structure
                      </>
                    )}
                  </Button>
                </div>
              )}
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <Label className="text-muted-foreground">Total Collected</Label>
                  <div className="text-xl font-bold">${payouts.totalCollected.toFixed(2)}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">House Fee</Label>
                  <div className="text-xl font-bold text-orange-600">
                    ${payouts.houseFee.toFixed(2)}
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Pot Amount</Label>
                  <div className="text-xl font-bold text-green-600">
                    ${payouts.potAmount.toFixed(2)}
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Total Payouts</Label>
                  <div className={`text-xl font-bold ${
                    isManualMode && Math.abs(
                      editingPayouts.reduce((sum, p) => sum + p.amount, 0) - payouts.potAmount
                    ) > 0.01 ? "text-red-600" : ""
                  }`}>
                    ${(isManualMode 
                      ? editingPayouts.reduce((sum, p) => sum + p.amount, 0)
                      : payouts.payouts.reduce((sum, p) => sum + p.amount, 0)
                    ).toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Validation Alert */}
              {isManualMode && (() => {
                const totalPayouts = editingPayouts.reduce((sum, p) => sum + p.amount, 0);
                const difference = Math.abs(totalPayouts - payouts.potAmount);
                if (difference > 0.01) {
                  return (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Total payouts (${totalPayouts.toFixed(2)}) does not match pot amount (${payouts.potAmount.toFixed(2)}). 
                        Difference: ${difference.toFixed(2)}
                      </AlertDescription>
                    </Alert>
                  );
                }
                return null;
              })()}

              {/* Payout Table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Place</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Percentage</TableHead>
                    {isManualMode && <TableHead>Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(isManualMode ? editingPayouts : payouts.payouts).map((payout, index) => (
                    <TableRow key={payout.place}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {payout.place === 1 && <Badge variant="default">🥇</Badge>}
                          {payout.place === 2 && <Badge variant="secondary">🥈</Badge>}
                          {payout.place === 3 && <Badge variant="outline">🥉</Badge>}
                          <span className="font-medium">
                            {payout.place === 1
                              ? "1st Place"
                              : payout.place === 2
                              ? "2nd Place"
                              : payout.place === 3
                              ? "3rd Place"
                              : `${payout.place}th Place`}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {isManualMode ? (
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">$</span>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={payout.amount}
                              onChange={(e) => handleUpdatePayoutAmount(index, parseFloat(e.target.value) || 0)}
                              className="max-w-[150px]"
                            />
                          </div>
                        ) : (
                          <div className="text-lg font-bold text-green-600">
                            ${payout.amount.toFixed(2)}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {payout.percentage.toFixed(1)}%
                        </div>
                      </TableCell>
                      {isManualMode && (
                        <TableCell>
                          <Button
                            onClick={() => handleRemovePayoutPlace(index)}
                            size="sm"
                            variant="ghost"
                            disabled={editingPayouts.length === 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {totalCollected === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No payments collected yet.</p>
              <p className="text-sm mt-2">
                Mark players as "Paid" in the Players tab to calculate payouts.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

