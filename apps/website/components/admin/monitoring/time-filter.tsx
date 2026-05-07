"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface TimeFilterOption {
  value: string;
  label: string;
}

interface TimeFilterProps {
  value: string;
  onChange: (value: string) => void;
  options: TimeFilterOption[];
}

export function TimeFilter({ value, onChange, options }: TimeFilterProps) {
  return (
    <Card className="p-1">
      <div className="flex flex-wrap gap-1">
        {options.map((option) => (
          <Button
            key={option.value}
            variant={value === option.value ? "default" : "ghost"}
            size="sm"
            onClick={() => onChange(option.value)}
            className="flex-shrink-0"
          >
            {option.label}
          </Button>
        ))}
      </div>
    </Card>
  );
}
