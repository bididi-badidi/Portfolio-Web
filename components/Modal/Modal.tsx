"use client";

import { ModalProvider } from "@/app/context/ModalContext";
import { ChatWindow } from "@/components/Portfolio/ChatWindow";

export function Modal() {
  return (
    <div data-site-chat>
      <ModalProvider>
        <ChatWindow />
      </ModalProvider>
    </div>
  );
}
