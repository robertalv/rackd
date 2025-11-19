"use client";

import { useState, useEffect } from "react";
import { Input } from "@rackd/ui/components/input";
import { Slider } from "@rackd/ui/components/slider";
import { Popover, PopoverTrigger, PopoverContent } from "@rackd/ui/components/popover";
import { ChevronDownIcon } from "lucide-react";
import { cn } from "@rackd/ui/lib/utils";
import { HeaderLabel } from "@rackd/ui/components/label";

interface FargoRatingSelectProps {
  value?: [number, number];
  onValueChange?: (value: [number, number]) => void;
  className?: string;
  children?: React.ReactNode;
  asChild?: boolean;
}

const FARGO_RANGES = [
  { min: 0, max: 289, label: "Below 290", apa: "2" },
  { min: 0, max: 290, label: "< 290", apa: "2" },
  { min: 291, max: 350, label: "291-350", apa: "3" },
  { min: 351, max: 410, label: "351-410", apa: "4" },
  { min: 411, max: 470, label: "411-470", apa: "5" },
  { min: 471, max: 540, label: "471-540", apa: "6" },
  { min: 541, max: 620, label: "541-620", apa: "7" },
  { min: 621, max: 900, label: "621 +", apa: "Elite" }
];

export function FargoRatingSelect({ 
  value = [200, 900], 
  onValueChange,
  className,
  children,
  asChild = false
}: FargoRatingSelectProps) {
  const [sliderValue, setSliderValue] = useState(value);

  useEffect(() => {
    setSliderValue(value);
  }, [value]);

  const handleSliderChange = (newValue: number[]) => {
    const updatedValue: [number, number] = [newValue[0] ?? 0, newValue[1] ?? 0];
    setSliderValue(updatedValue);
    onValueChange?.(updatedValue);
  };

  const handleInputChange = (index: 0 | 1, inputValue: string) => {
    const numValue = parseInt(inputValue, 10);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 900) {
      const newValue = [...sliderValue] as [number, number];
      newValue[index] = numValue;
      // Ensure min <= max
      if (index === 0 && numValue > newValue[1]) {
        newValue[1] = numValue;
      } else if (index === 1 && numValue < newValue[0]) {
        newValue[0] = numValue;
      }
      setSliderValue(newValue);
      onValueChange?.(newValue);
    }
  };

  const getDisplayText = () => {
    if (sliderValue[0] === 200 && sliderValue[1] === 900) {
      return "Any";
    }
    return `${sliderValue[0]} - ${sliderValue[1]}`;
  };

  const renderTrigger = () => {
    if (asChild && children) {
      return (
        <PopoverTrigger asChild className="w-full">
          {children}
        </PopoverTrigger>
      );
    }
    
    return (
      <PopoverTrigger asChild>
        <button
          className={cn(
            "border-input cursor-pointer data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-full items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50 h-9",
            className
          )}
        >
          <span>{getDisplayText()}</span>
          <ChevronDownIcon className="size-4 opacity-50" />
        </button>
      </PopoverTrigger>
    );
  };

  return (
    <Popover>
      {renderTrigger()}
      
      <PopoverContent 
        className="w-80 p-6" 
        align="start"
        sideOffset={5}
      >
        <div className="space-y-6">
          <HeaderLabel size="lg">Fargo Rating</HeaderLabel>
          
          {/* Slider */}
          <div className="px-2">
            <Slider
              min={200}
              max={900}
              step={10}
              value={sliderValue}
              onValueChange={handleSliderChange}
              className="w-full"
            />
          </div>

          {/* Value Display */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex flex-col items-center">
              <span className="font-medium">From</span>
              <Input
                type="number"
                value={sliderValue[0]}
                onChange={(e) => handleInputChange(0, e.target.value)}
                className="w-20 h-12 text-center text-xl font-bold mt-1"
                min={0}
                max={900}
              />
            </div>
            
            <div className="flex-1 flex items-center justify-center">
              <span className="text-muted-foreground">Or</span>
            </div>
            
            <div className="flex flex-col items-center">
              <span className="font-medium">To</span>
              <Input
                type="number"
                value={sliderValue[1]}
                onChange={(e) => handleInputChange(1, e.target.value)}
                className="w-20 h-12 text-center text-xl font-bold mt-1"
                min={0}
                max={900}
              />
            </div>
          </div>

          {/* Fargo Range Options */}
          <div className="space-y-2">
            {FARGO_RANGES.map((range, index) => {
              const isExactRangeSelected = sliderValue[0] === range.min && sliderValue[1] === range.max;
              const isRangePartiallySelected = sliderValue[0] <= range.max && sliderValue[1] >= range.min;
              
              return (
                <label key={index} className="flex items-center space-x-3 cursor-pointer hover:bg-accent p-2 rounded">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                    checked={isExactRangeSelected}
                    onChange={(e) => {
                      if (e.target.checked) {
                        handleSliderChange([range.min, range.max]);
                      } else if (isExactRangeSelected) {
                        handleSliderChange([200, 900]);
                      }
                    }}
                  />
                  <div className="flex-1 flex justify-between">
                    <span className={`text-sm font-medium ${isRangePartiallySelected && !isExactRangeSelected ? 'text-muted-foreground' : ''}`}>
                      {range.label}
                    </span>
                    <span className="text-sm font-bold">{range.apa}</span>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

