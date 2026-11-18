import { useEffect, useId, useRef, type ReactNode } from "react";
import styled from "styled-components";

const Dialog = styled.dialog`
  position: fixed;
  inset: 0;
  width: min(calc(100% - 48px), 322px);
  max-width: none;
  margin: auto;
  padding: 28px 24px 20px;
  border: 0;
  border-radius: 24px;
  background: white;
  color: #1a1a1a;
  text-align: center;

  &::backdrop { background: rgb(0 0 0 / 50%); }
  h2 { margin: 0; font-size: 18px; line-height: 25px; }
  p { margin: 8px 0 24px; color: #5c5c63; font-size: 14px; line-height: 20px; }
  p[role="alert"] { margin: -12px 0 16px; color: #e5484d; }
  footer { display: flex; gap: 8px; }
  footer button {
    min-height: 52px;
    flex: 1;
    padding: 8px;
    border: 0;
    border-radius: 14px;
    background: #f3f5fa;
    color: #1a1a1a;
    font-size: 15px;
    font-weight: 700;
    text-align: center;
  }
  footer button[data-primary] { background: #090738; color: white; }
  footer button[data-tone="danger"] { background: #e5484d; }
  footer button:disabled { opacity: 0.65; cursor: default; }
`;

interface SettingsConfirmDialogProps {
  title: ReactNode;
  description: ReactNode;
  cancelLabel?: string;
  confirmLabel: string;
  tone?: "danger";
  pending?: boolean;
  error?: string;
  onCancel: () => void;
  onDismiss?: () => void;
  onConfirm: () => void;
}

export default function SettingsConfirmDialog({
  title, description, cancelLabel = "취소", confirmLabel, tone, pending, error, onCancel, onDismiss, onConfirm,
}: SettingsConfirmDialogProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const id = useId();

  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    return () => element?.close();
  }, []);

  return (
    <Dialog ref={dialog} role="alertdialog" aria-labelledby={id} aria-describedby={id + "-description"}
      onCancel={(event) => { event.preventDefault(); if (!pending) (onDismiss ?? onCancel)(); }}
    >
      <h2 id={id}>{title}</h2>
      <p id={id + "-description"}>{description}</p>
      {error && <p role="alert">{error}</p>}
      <footer>
        <button type="button" autoFocus={!onDismiss} disabled={pending} onClick={onCancel}>{cancelLabel}</button>
        <button type="button" autoFocus={Boolean(onDismiss)} data-primary data-tone={tone} disabled={pending} onClick={onConfirm}>{confirmLabel}</button>
      </footer>
    </Dialog>
  );
}
