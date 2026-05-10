"use client";
import React, { useRef, useEffect } from "react";
import { ModalProvider } from "@/app/context/ModalContext";
import { ModalTrigger } from "./ModalTrigger";
import { ModalBody } from "./ModalBody";
import { ModalContent } from "./ModalContent";
import { ModalFooter } from "./ModalFooter";

export function Modal() {
  const listEndRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, []);

  const scrollToBottom = () => {
    setTimeout(() => {
      if (listEndRef.current) {
        listEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  return (
    <div className="w-screen flex items-center justify-center">
      <ModalProvider>
        <ModalTrigger
          onOpen={scrollToBottom}
          className="fixed bottom-[42px] right-4 z-5 cursor-pointer sm:hidden"
        >
          <span className="text-center">Initiate AI</span>
        </ModalTrigger>
        <ModalBody>
          <ModalContent />
          <ModalFooter />
        </ModalBody>
      </ModalProvider>
    </div>
  );
}
