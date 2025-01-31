export interface StateCardProps {
    state: readonly string[];
    selectedState: string;
    onStateSelect: (state: string) => void;
  }