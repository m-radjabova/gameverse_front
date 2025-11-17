import { Radio } from "@mui/material";

const colors: Record<string, string> = {
  TODO: "#7f8c8d",
  INPROGRESS: "#3498db",
  VERIFIED: "#9b59b6",
  DONE: "#2ecc71",
};

const statusLabels: Record<string, string> = {
  TODO: "To Do",
  INPROGRESS: "In Progress",
  VERIFIED: "Verified",
  DONE: "Done",
};

interface StatusOptionProps {
  title: string;
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
}

function StatusOption({ title, selected, onClick, disabled }: StatusOptionProps) {
  return (
    <div
      className={`status-option ${selected ? "selected" : ""}`}
      onClick={!disabled ? onClick : undefined}
      style={{
        opacity: disabled ? 0.5 : 1, 
        cursor: disabled ? "not-allowed" : "pointer",
        pointerEvents: disabled ? "none" : "auto",
      }}
    >
      <Radio
        className="status-option-radio"
        checked={selected}
        disabled={disabled}            
        sx={{ 
          color: `${colors[title]} !important`,
          '&.Mui-checked': {
            color: `${colors[title]} !important`,
          }
        }}
      />

      <div className="status-option-content">
        <div className="status-option-title">
          {statusLabels[title] || title}
        </div>

        <div className="status-option-subtitle">
          <div 
            className="status-color-indicator" 
            style={{ backgroundColor: colors[title] }}
          />

          {disabled
            ? "Already added"           
            : selected
            ? "Selected"
            : "Click to select"}
        </div>
      </div>
    </div>
  );
}

export default StatusOption;