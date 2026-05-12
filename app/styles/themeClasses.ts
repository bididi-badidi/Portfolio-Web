export const themeClasses = {
  text: {
    primary: "text-bright",
    secondary: "text-foreground",
    muted: "text-muted",
    faint: "text-faint",
    inverse: "text-inverse",
    onAccent: "text-[var(--color-text-on-accent)]",
  },
  gradient: {
    heading:
      "bg-gradient-to-br from-heading-from to-heading-to bg-clip-text text-transparent",
    heroHeading:
      "bg-gradient-to-b from-hero-heading-from to-hero-heading-to bg-clip-text text-transparent",
    primaryAction:
      "bg-gradient-to-r from-accent-secondary to-accent hover:from-accent hover:to-accent-secondary-hover",
  },
  surface: {
    page: "bg-background",
    panel: "bg-surface border border-subtle",
    panelSubtle: "bg-surface/50 border border-subtle",
    elevated: "bg-elevated border border-subtle",
    glass: "bg-glass border border-glass-border backdrop-blur-xl",
    glassHover:
      "bg-glass border border-glass-border hover:bg-glass-hover hover:border-glass-border-strong backdrop-blur-xl",
    overlay: "bg-overlay",
    scrim: "bg-scrim",
  },
  button: {
    primary:
      "border border-white/15 bg-white/[0.035] text-bright backdrop-blur-xl shadow-[inset_0_1px_0_rgb(255_255_255_/_0.18),0_0_18px_rgb(255_255_255_/_0.045)] transition-[background-color,border-color,box-shadow,filter] hover:border-white/25 hover:bg-white/[0.07] hover:shadow-[inset_0_1px_0_rgb(255_255_255_/_0.28),0_0_24px_rgb(129_140_248_/_0.18)] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50",
    secondary:
      "bg-surface/60 border border-subtle text-foreground shadow-sm transition-colors hover:bg-elevated hover:text-bright hover:border-glass-border-strong focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50",
    ghost:
      "text-foreground transition-colors hover:text-bright hover:bg-glass focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50",
  },
  control: {
    focusRing: "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50",
    iconButton:
      "text-foreground hover:text-bright transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50",
    navItem: "text-bright hover:text-foreground transition-colors",
  },
  chat: {
    bubbleBase:
      "py-3 px-5 rounded-[14px] text-start justify-center mt-6 max-w-[85%] backdrop-blur-2xl border border-glass-border shadow-[0_16px_48px_rgb(0_0_0_/_0.22),inset_0_1px_0_rgb(255_255_255_/_0.08)]",
    botBubble:
      "bg-[var(--color-chat-bot-bg)] text-[var(--color-chat-bot-text)] self-start rounded-tl-[4px] shadow-indigo-500/10",
    userBubble:
      "bg-[var(--color-chat-user-bg)] text-[var(--color-chat-user-text)] self-end rounded-tr-[4px] shadow-black/20",
    errorBubble:
      "bg-error-bg text-error-text self-start rounded-tl-[4px] shadow-error/10 border-error-border",
  },
} as const;
