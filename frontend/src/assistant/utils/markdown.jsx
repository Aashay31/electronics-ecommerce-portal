import React from "react";

function formatInline(text) {
  const segments = [];
  const regex = /(\*\*([^*]+)\*\*|`([^`]+)`)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push(text.slice(lastIndex, match.index));
    }

    if (match[2]) {
      segments.push(
        <strong key={`${match.index}-bold`} className="font-semibold text-white">
          {match[2]}
        </strong>
      );
    } else if (match[3]) {
      segments.push(
        <code
          key={`${match.index}-code`}
          className="rounded-md bg-white/10 px-1.5 py-0.5 text-[0.92em] text-cyan-100"
        >
          {match[3]}
        </code>
      );
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    segments.push(text.slice(lastIndex));
  }

  return segments;
}

export function renderMarkdown(content = "") {
  const lines = content.split("\n").filter((line, index, arr) => line.trim() || (index > 0 && arr[index - 1].trim()));
  const elements = [];
  let listItems = [];

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="space-y-1 pl-4 text-sm text-slate-200">
          {listItems.map((item, index) => (
            <li key={`${item}-${index}`} className="list-disc">
              {formatInline(item)}
            </li>
          ))}
        </ul>
      );
      listItems = [];
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      return;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      listItems.push(trimmed.replace(/^[-*]\s+/, ""));
      return;
    }

    flushList();
    elements.push(
      <p key={`p-${index}`} className="text-sm leading-6 text-slate-200">
        {formatInline(trimmed)}
      </p>
    );
  });

  flushList();
  return elements;
}
