import { Fragment } from "react";
import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";

/**
 * Matematik formulalarni LaTeX bilan render qiladi.
 * 
 * Foydalanish:
 *   <MathText text="Tenglama: $x^2 + 2 = 0$, javob: $x = \\pm\\sqrt{2}$" />
 * 
 * Qo'llab-quvvatlanadi:
 *   - $...$ — inline formula
 *   - $$...$$ — block formula
 *   - Oddiy matn (formulasiz)
 */
const MathText = ({ text = "", className = "" }) => {
  if (!text) return null;

  // String'ni $...$ va $$...$$ ga parse qilish
  const parts = parseMathText(text);

  return (
    <span className={className}>
      {parts.map((part, idx) => {
        if (part.type === "block") {
          return (
            <span key={idx} className="block my-2">
              <BlockMath
                math={part.content}
                errorColor="#dc2626"
                renderError={() => <span className="text-red-600">[formula xato: {part.content}]</span>}
              />
            </span>
          );
        }
        if (part.type === "inline") {
          return (
            <InlineMath
              key={idx}
              math={part.content}
              errorColor="#dc2626"
              renderError={() => <span className="text-red-600">[{part.content}]</span>}
            />
          );
        }
        return <Fragment key={idx}>{part.content}</Fragment>;
      })}
    </span>
  );
};

function parseMathText(text) {
  const parts = [];
  let remaining = String(text);

  while (remaining.length > 0) {
    // Avval $$...$$ qidiramiz (block)
    const blockMatch = remaining.match(/^([\s\S]*?)\$\$([\s\S]+?)\$\$/);
    // Keyin $...$ (inline)
    const inlineMatch = remaining.match(/^([\s\S]*?)\$([^\$\n]+?)\$/);

    let next = null;
    if (blockMatch && inlineMatch) {
      // Qaysi biri oldinroq?
      next = blockMatch.index <= inlineMatch.index ? { ...blockMatch, _type: "block" } : { ...inlineMatch, _type: "inline" };
      // re-match with proper type
      next = blockMatch[1].length <= inlineMatch[1].length
        ? { match: blockMatch, type: "block" }
        : { match: inlineMatch, type: "inline" };
    } else if (blockMatch) {
      next = { match: blockMatch, type: "block" };
    } else if (inlineMatch) {
      next = { match: inlineMatch, type: "inline" };
    }

    if (!next) {
      // Hech qanday formula yo'q — qolgan matnni qo'shamiz
      parts.push({ type: "text", content: remaining });
      break;
    }

    const [full, before, formula] = next.match;
    if (before) parts.push({ type: "text", content: before });
    parts.push({ type: next.type, content: formula.trim() });
    remaining = remaining.slice(full.length);
  }

  return parts;
}

export default MathText;
