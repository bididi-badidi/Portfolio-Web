"use client";
import React, { useRef, useEffect } from "react";
import { motion, LayoutGroup } from "motion/react";
import { useModal } from "@/app/context/ModalContext";
import { themeClasses } from "@/app/styles/themeClasses";
import { cn } from "@/app/utils/cn";
import { useUIState } from "@/app/context/UIStateContext";
import { ChatInstance } from "@/app/interfaces/Chatbot";

const itemVariants = {
  hidden: { y: 50, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      type: "spring",
      damping: 12,
    },
  },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 1,
    },
  },
};

export function ModalContent() {
  const { chatHistory } = useModal();
  const { isChatOpen, allowAnimation } = useUIState();
  const listEndRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const scrollToBottom = () => {
    setTimeout(() => {
      if (listEndRef.current) {
        listEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  return (
    <div className={cn("flex flex-col-reverse flex-1 px-4 pb-4 h-full overflow-y-scroll")}>
      <motion.ul
        variants={allowAnimation ? containerVariants : undefined}
        initial="hidden"
        animate={isChatOpen ? "visible" : "exit"}
        className="w-full pb-2 flex flex-col items-stretch"
      >
        <LayoutGroup>
          {isChatOpen &&
            chatHistory
              .filter((chat) => chat.role != "system")
              .map((chat: ChatInstance) => (
                <motion.li
                  key={chat.id}
                  variants={itemVariants}
                  className={cn(
                    themeClasses.chat.bubbleBase,
                    chat.role == "bot"
                      ? chat.isError
                        ? themeClasses.chat.errorBubble
                        : themeClasses.chat.botBubble
                      : themeClasses.chat.userBubble,
                  )}
                >
                  <span
                    className={cn(
                      chat.role == "bot"
                        ? chat.isError
                          ? "text-error-text"
                          : "text-[var(--color-chat-bot-text)]"
                        : "text-[var(--color-chat-user-text)]",
                      "text-sm text-start",
                    )}
                  >
                    {chat.message}
                  </span>
                </motion.li>
              ))}
          <div ref={listEndRef}></div>
        </LayoutGroup>
      </motion.ul>
    </div>
  );
}
