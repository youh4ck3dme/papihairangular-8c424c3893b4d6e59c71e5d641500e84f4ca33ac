// fix-readme-mdlint.js
const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "README.md");
const original = fs.readFileSync(filePath, "utf8");
let lines = original.split(/\r?\n/);

// ---------- STEP 1: Blank lines around fenced code blocks (MD031) ----------
(function fixFences() {
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const fenceMatch = line.match(/^(`{3,}|~{3,})/);
    if (!fenceMatch) {
      i++;
      continue;
    }

    // ensure blank line before opening/closing fence
    if (i > 0 && lines[i - 1].trim() !== "") {
      lines.splice(i, 0, "");
      i++; // posun na fence
    }

    // nájdi closing fence (alebo koniec)
    let j = i + 1;
    while (j < lines.length && !lines[j].match(/^(`{3,}|~{3,})/)) {
      j++;
    }

    if (j < lines.length) {
      // máme closing fence na indexe j
      // ensure blank line after closing fence
      if (j + 1 < lines.length && lines[j + 1].trim() !== "") {
        lines.splice(j + 1, 0, "");
      }
      i = j + 2; // skoč za closing fence + prípadný prázdny riadok
    } else {
      // nenašli sme closing fence, končíme
      break;
    }
  }
})();

// Helper: is line a list item?
function isListItem(line) {
  return (
    /^\s*[-+*]\s+/.test(line) || // unordered
    /^\s*\d+\.\s+/.test(line)    // ordered
  );
}

// ---------- STEP 2: Blank lines around headings (MD022) ----------
(function fixHeadings() {
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (/^#{1,6}\s+/.test(line.trim())) {
      // blank line before heading
      if (i > 0 && lines[i - 1].trim() !== "") {
        lines.splice(i, 0, "");
        i++;
      }
      // blank line after heading
      if (i + 1 < lines.length && lines[i + 1].trim() !== "") {
        lines.splice(i + 1, 0, "");
      }
      i += 2; // preskoč heading + prázdny riadok
    } else {
      i++;
    }
  }
})();

// ---------- STEP 3: Blank lines around lists (MD032) ----------
(function fixLists() {
  let i = 0;
  let inFence = false;

  while (i < lines.length) {
    const line = lines[i];

    // toggle fenced block
    if (/^(`{3,}|~{3,})/.test(line)) {
      inFence = !inFence;
      i++;
      continue;
    }

    if (inFence || !isListItem(line)) {
      i++;
      continue;
    }

    // list start
    let start = i;
    let end = i;

    // find full list range
    while (end < lines.length && isListItem(lines[end])) {
      end++;
    }

    // blank line before list
    if (start > 0 && lines[start - 1].trim() !== "") {
      lines.splice(start, 0, "");
      start++;
      end++;
    }

    // blank line after list
    if (end < lines.length && lines[end].trim() !== "") {
      lines.splice(end, 0, "");
      end++;
    }

    i = end;
  }
})();

// ---------- STEP 4: Normalize ordered list numbering to 1. (MD029) ----------
(function normalizeOrderedLists() {
  let inFence = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // toggle fenced block
    if (/^(`{3,}|~{3,})/.test(line)) {
      inFence = !inFence;
      continue;
    }

    if (inFence) continue;

    // len mimo fenced blokov
    if (/^\s*\d+\.\s+/.test(line)) {
      lines[i] = line.replace(/^\s*\d+(\.\s+)/, "1$1");
    }
  }
})();

// ---------- Write back if changed ----------
const updated = lines.join("\n");
if (updated !== original) {
  fs.writeFileSync(filePath, updated, "utf8");
  console.log("README.md upravený (markdownlint MD022/MD031/MD032/MD029).");
} else {
  console.log("README.md už bol v poriadku, žiadne zmeny.");
}
