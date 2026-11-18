import { useRef, useState, type PointerEvent } from "react";
import styled from "styled-components";

const expandedHeight = "calc(100dvh - 24px)";

const Handle = styled.button`
  position: absolute;
  z-index: 3;
  top: 0;
  left: 50%;
  width: 80px;
  height: 32px;
  border: 0;
  padding: 0;
  background: transparent;
  transform: translateX(-50%);
  touch-action: none;
  user-select: none;
  && { cursor: ns-resize; }

  &::after {
    position: absolute;
    top: var(--sheet-handle-top, 8px);
    left: 50%;
    width: var(--sheet-handle-width, 36px);
    height: var(--sheet-handle-height, 5px);
    border-radius: 4px;
    background: var(--sheet-handle-color, #d9d9de);
    transform: translateX(-50%);
    content: "";
  }

  &:focus-visible {
    outline: 2px solid #7a6fe0;
    outline-offset: -2px;
    border-radius: 10px;
  }

  &&[aria-disabled="true"] {
    cursor: default;
  }
`;

type Drag = {
  pointerId: number;
  startY: number;
  startHeight: number;
  restingHeight: number;
  maxHeight: number;
  moved: boolean;
};

function measure(panel: HTMLElement) {
  const originalHeight = panel.style.height;
  const startHeight = panel.offsetHeight;
  panel.style.removeProperty("height");
  const restingHeight = panel.offsetHeight;
  panel.style.height = expandedHeight;
  const maxHeight = panel.offsetHeight;
  panel.style.height = originalHeight;
  return { startHeight, restingHeight, maxHeight };
}

interface SheetHandleProps {
  onClose: () => void;
  closeDisabled?: boolean;
  tapToClose?: boolean;
  className?: string;
}

export default function SheetHandle({ onClose, closeDisabled, tapToClose, className }: SheetHandleProps) {
  const [expanded, setExpanded] = useState(false);
  const drag = useRef<Drag | null>(null);
  const ignoreClick = useRef(false);

  function settle(panel: HTMLElement, expand: boolean) {
    panel.style.height = expand ? expandedHeight : "";
    panel.style.removeProperty("translate");
    setExpanded(expand);
  }

  function start(event: PointerEvent<HTMLButtonElement>) {
    // The handle sits directly inside the panel whose height it controls.
    const panel = event.currentTarget.parentElement;
    if (!panel || closeDisabled || !event.isPrimary || event.button !== 0) return;
    drag.current = { pointerId: event.pointerId, startY: event.clientY, moved: false, ...measure(panel) };
    ignoreClick.current = false;
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function move(event: PointerEvent<HTMLButtonElement>) {
    const panel = event.currentTarget.parentElement;
    const active = drag.current;
    if (!panel || active?.pointerId !== event.pointerId || closeDisabled) return;
    const distance = event.clientY - active.startY;
    if (Math.abs(distance) >= 5) active.moved = true;
    const height = active.startHeight - distance;
    panel.style.height = `${Math.max(active.restingHeight, Math.min(height, active.maxHeight))}px`;
    panel.style.translate = `0 ${Math.max(0, active.restingHeight - height)}px`;
  }

  function finish(event: PointerEvent<HTMLButtonElement>, cancelled: boolean) {
    const panel = event.currentTarget.parentElement;
    const active = drag.current;
    if (!panel || active?.pointerId !== event.pointerId) return;
    drag.current = null;
    const distance = event.clientY - active.startY;
    ignoreClick.current = cancelled || active.moved || Math.abs(distance) >= 5;
    if (cancelled || closeDisabled || !ignoreClick.current) {
      settle(panel, expanded);
      return;
    }

    const belowRest = active.restingHeight - active.startHeight + distance;
    const dismissDistance = Math.max(48, Math.min(144, active.restingHeight * 0.28));
    if (belowRest >= dismissDistance) {
      settle(panel, false);
      onClose();
      return;
    }

    const expansion = active.maxHeight - active.restingHeight;
    const snapDistance = Math.min(36, expansion / 2);
    const expand = expansion > 2 && (expanded ? distance < snapDistance : distance <= -snapDistance);
    settle(panel, expand);
  }

  return (
    <Handle
      type="button"
      className={className}
      aria-label={tapToClose ? "여행 만들기 닫기" : "시트 높이 조절"}
      aria-expanded={tapToClose ? undefined : expanded}
      aria-disabled={closeDisabled || undefined}
      onPointerDown={start}
      onPointerMove={move}
      onPointerUp={(event) => finish(event, false)}
      onPointerCancel={(event) => finish(event, true)}
      onLostPointerCapture={(event) => finish(event, true)}
      onClick={(event) => {
        if (closeDisabled || (event.detail > 0 && ignoreClick.current)) return;
        if (tapToClose) {
          onClose();
          return;
        }
        const panel = event.currentTarget.parentElement;
        if (panel) settle(panel, !expanded && measure(panel).maxHeight > panel.offsetHeight + 2);
      }}
      onKeyDown={(event) => {
        const panel = event.currentTarget.parentElement;
        if (!panel || closeDisabled || (event.key !== "ArrowUp" && event.key !== "ArrowDown")) return;
        event.preventDefault();
        if (event.key === "ArrowUp") {
          if (measure(panel).maxHeight > panel.offsetHeight + 2) settle(panel, true);
        } else if (expanded) {
          settle(panel, false);
        } else {
          onClose();
        }
      }}
    />
  );
}
