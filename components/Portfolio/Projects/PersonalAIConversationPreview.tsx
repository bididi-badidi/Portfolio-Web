import { ArrowUpRight, BookOpen, MessageCircle, MousePointer2 } from "lucide-react";
import styles from "./project.module.css";

export function PersonalAIConversationPreview({ onOpen }: { onOpen: () => void }) {
  return (
    <>
      <div className={styles.contextRail}>
        <span className={styles.visualLabel}>BUILT AROUND THE CONVERSATION</span>
        <div>
          <BookOpen size={19} strokeWidth={1.5} aria-hidden="true" />
          <span>Knowledge of the work</span>
        </div>
        <div>
          <MessageCircle size={19} strokeWidth={1.5} aria-hidden="true" />
          <span>Context from the conversation</span>
        </div>
        <div>
          <MousePointer2 size={19} strokeWidth={1.5} aria-hidden="true" />
          <span>Actions when you ask</span>
        </div>
      </div>
      <div className={styles.conversation}>
        <div className={styles.conversationHeader}>
          <span className={styles.avatar} aria-hidden="true">Z</span>
          <span>Zi Shen’s AI</span>
          <span className={styles.exampleLabel}>Example conversation</span>
        </div>
        <div className={styles.conversationBody}>
          <p className={styles.exampleQuestion}>What have you been building?</p>
          <div className={styles.exampleAnswer}>
            <span>ZI SHEN’S AI</span>
            <p>AI assistants, automated workflows, and software that makes everyday work a little easier.</p>
          </div>
        </div>
        <button type="button" className={styles.conversationAction} onClick={onOpen}>
          Start your own conversation <ArrowUpRight size={17} aria-hidden="true" />
        </button>
      </div>
    </>
  );
}
