import { useState } from "react";
import { Checkbox } from "@shopify/polaris";
import '../styles/ToggleSwitch.css'

export default function ToggleSwitch() {
  const [isChecked, setIsChecked] = useState(false);

  return (
    <label className="toggle-switch">
      <input
        type="checkbox"
        checked={isChecked}
        onChange={() => setIsChecked(!isChecked)}
      />
      <span className="slider"></span>
    </label>
  );
}
