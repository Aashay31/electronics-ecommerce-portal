import { useState } from "react";
import { Mic, SendHorizonal } from "lucide-react";

function ChatInput({ onSend, disabled }) {
  const [value, setValue] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!value.trim() || disabled) {
      return;
    }
    onSend(value.trim());
    setValue("");
  };

  const handleVoiceInput = () => {
    const Recognition =
      window.SpeechRecognition || window.webkitSpeechRecognition || null;

    if (!Recognition) {
      return;
    }

    const recognition = new Recognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript;
      if (transcript) {
        setValue(transcript);
      }
    };
    recognition.start();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 border-t border-slate-200 dark:border-white/10 bg-white dark:bg-transparent px-4 py-4">
      <div className="rounded-[1.5rem] border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-2 shadow-none dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
        <div className="flex items-end gap-2">
          <textarea
            value={value}
            onChange={(event) => setValue(event.target.value)}
            rows={1}
            placeholder="Ask about orders, components, product comparisons, or electronics guidance"
            className="max-h-28 min-h-[44px] flex-1 resize-none bg-transparent px-3 py-2 text-sm text-slate-900 dark:text-white outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
          <button
            type="button"
            onClick={handleVoiceInput}
            className="rounded-full border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 p-2 text-slate-600 dark:text-slate-300 transition hover:bg-slate-200 dark:hover:bg-white/10"
            aria-label="Voice input"
          >
            <Mic className="h-4 w-4" />
          </button>
          <button
            type="submit"
            disabled={disabled || !value.trim()}
            className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-slate-100 dark:disabled:bg-white/5 disabled:text-slate-400 dark:disabled:text-slate-600"
          >
            <SendHorizonal className="h-4 w-4" />
          </button>
        </div>
      </div>
      <p className="text-[11px] text-slate-400 dark:text-slate-500">
        The assistant uses live account and catalog context but never changes orders or payments directly.
      </p>
    </form>
  );
}

export default ChatInput;
