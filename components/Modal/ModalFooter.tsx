"use client";
import { cn } from "@/app/utils/cn";
import { useState } from "react";
import { ChatInstance } from "@/app/interfaces/Chatbot";
import { motion, AnimatePresence } from "motion/react";
import { fetchChatbotReply } from "@/app/lib/chatbot/fetchReply";
import { ChatReply } from "@/app/lib/chatbot/types";
import { executeFunctionCall } from "@/app/lib/chatbot/functionHandlers";
import { v4 as uuidv4 } from "uuid";
import { useModal } from "@/app/context/ModalContext";
import { ChatbotInput } from "./ChatbotInput";
import { useAppActions } from "@/app/context/AppActionsContext";
import { useUIState } from "@/app/context/UIStateContext";
import { 
  CHATBOT_WAITING_PLACEHOLDER, 
  MAX_CHAT_HISTORY_INSTANCE,
  CHAT_TIMEOUT_MS,
  REPLY_ERROR_FALLBACK_MSG
} from "@/app/lib/chatbot/config";
import { AnimatedToggleButton } from "../Buttons/AnimatedToggleButton";

const AnimationToggleButton = () => {
  const { allowAnimation, setAllowAnimation } = useUIState();
  return <AnimatedToggleButton text="Animation" isOn={allowAnimation} setIsOn={setAllowAnimation} ambient={false} />;
};

const FunctionCallToggleButton = ({ isOn, setIsOn }: { isOn: boolean; setIsOn: (open: boolean) => void }) => {
  const { isChatOpen } = useUIState();

  return (
    <AnimatedToggleButton
      text="Function Call"
      isOn={isOn}
      setIsOn={setIsOn}
      ambient={isChatOpen}
      firstTimeDelay={2000}
    />
  );
};

const footerVariants = {
  hidden: { y: 50, opacity: 0, duration: 0.5 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      delay: 0.7,
      duration: 0.5,
      type: "spring",
    },
  },
};

const buttonGroupVariants = {
  hidden: {
    x: -70,
    opacity: 0,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 30,
      mass: 0.5,
    },
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 30,
      mass: 0.5,
    },
  },
};

export const ModalFooter = () => {
  const uiState = useUIState();
  const [enableFuncall, setEnableFuncall] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isFocus, setIsFocus] = useState(false);
  const { setChatHistory, chatHistory } = useModal();
  const appActions = useAppActions();

  const generateRandomId = () => {
    return uuidv4().slice(0, 8);
  };

  const handleSubmit = async (textInput: string) => {
    const updatedChatHistory = [
      ...chatHistory,
      {
        id: generateRandomId(),
        message: textInput,
        role: "user",
      } as ChatInstance,
    ];
    setChatHistory(updatedChatHistory);

    setIsThinking(true);
    const botId = generateRandomId();
    setTimeout(
      () =>
        setChatHistory((chatHistory: ChatInstance[]) => [
          ...chatHistory,
          { id: botId, message: CHATBOT_WAITING_PLACEHOLDER, role: "bot" },
        ]),
      500,
    );

    let reply: ChatReply;
    try {
      reply = (await Promise.race([
        fetchChatbotReply({
          chatHistory: updatedChatHistory.slice(-MAX_CHAT_HISTORY_INSTANCE),
          enableFunctionCalling: enableFuncall,
        }),
        new Promise<ChatReply>((_, reject) =>
          setTimeout(() => reject(new Error("Chatbot response timeout")), CHAT_TIMEOUT_MS)
        ),
      ])) as ChatReply;
    } catch (err) {
      console.error("Chatbot submission error:", err);
      reply = {
        message: REPLY_ERROR_FALLBACK_MSG,
        error: true,
      };
    }

    setIsThinking(false);
    setChatHistory((prev) =>
      prev
        .filter((chat) => chat.id !== botId)
        .concat([
          {
            id: generateRandomId(),
            message: reply.message,
            role: "bot",
            isError: reply.error,
          } as ChatInstance,
        ]),
    );

    if (!reply.error && reply.functionCall != null) {
      setChatHistory((prev) =>
        prev.concat([
          {
            id: generateRandomId(),
            message: reply.funcSysMsg,
            role: "system",
          } as ChatInstance,
        ]),
      );
      setTimeout(() => executeFunctionCall(reply.functionCall, appActions, uiState), 500);
    }
  };

  return (
    <AnimatePresence>
      {uiState.isChatOpen && (
        <motion.div
          variants={uiState.allowAnimation ? footerVariants : undefined}
          initial="hidden"
          animate={uiState.isChatOpen ? "visible" : "hidden"}
          exit="hidden"
          className={cn("relative flex gap-4 justify-end p-4 backdrop-blur-2xl bg-white/5")}
        >
          <AnimatePresence>
            {!isFocus && (
              <motion.div
                className="absolute left-[1rem] top-[1.5rem] flex items-center gap-4"
                variants={buttonGroupVariants}
                initial="hidden"
                animate={isFocus ? "hidden" : "visible"}
                exit="hidden"
              >
                <AnimationToggleButton />
                <FunctionCallToggleButton isOn={enableFuncall} setIsOn={setEnableFuncall} />
              </motion.div>
            )}
          </AnimatePresence>
          <ChatbotInput onSubmit={handleSubmit} isSubmitting={isThinking} isFocus={isFocus} setIsFocus={setIsFocus} />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
