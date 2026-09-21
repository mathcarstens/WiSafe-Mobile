const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const inputPath = path.join(root, "apresentacao-defesa-wisafe.md");
const outputPath = path.join(root, "apresentacao-defesa-wisafe.pdf");

const markdown = fs.readFileSync(inputPath, "utf8");

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN_X = 54;
const MARGIN_TOP = 54;
const MARGIN_BOTTOM = 54;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_X * 2;

function sanitize(text) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function escapePdf(text) {
  return text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function wrapText(text, fontSize) {
  const maxChars = Math.max(24, Math.floor(CONTENT_WIDTH / (fontSize * 0.52)));
  const words = sanitize(text).split(" ").filter(Boolean);
  const lines = [];
  let current = "";

  words.forEach((word) => {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  });

  if (current) lines.push(current);
  return lines;
}

function parseMarkdown(source) {
  const lines = source.split(/\r?\n/);
  const blocks = [];
  let inCode = false;
  let codeLines = [];

  lines.forEach((rawLine) => {
    const line = rawLine.trimEnd();

    if (line.startsWith("```")) {
      if (inCode) {
        blocks.push({ type: "code", text: codeLines.join("\n") });
        codeLines = [];
        inCode = false;
      } else {
        inCode = true;
      }
      return;
    }

    if (inCode) {
      codeLines.push(line);
      return;
    }

    if (!line.trim()) {
      blocks.push({ type: "space" });
      return;
    }

    if (line.startsWith("# ")) {
      blocks.push({ type: "title", text: line.replace(/^#\s+/, "") });
      return;
    }

    if (line.startsWith("## ")) {
      blocks.push({ type: "heading", text: line.replace(/^##\s+/, "") });
      return;
    }

    if (line.startsWith("- ")) {
      blocks.push({ type: "bullet", text: line.replace(/^-\s+/, "") });
      return;
    }

    if (/^\d+\.\s+/.test(line)) {
      blocks.push({ type: "number", text: line });
      return;
    }

    blocks.push({ type: "paragraph", text: line });
  });

  return blocks;
}

function buildPages(blocks) {
  const pages = [];
  let current = [];
  let y = PAGE_HEIGHT - MARGIN_TOP;

  function addLine(text, options = {}) {
    const font = options.font || "F1";
    const size = options.size || 11;
    const leading = options.leading || size + 5;
    const x = options.x || MARGIN_X;

    if (y - leading < MARGIN_BOTTOM) {
      pages.push(current);
      current = [];
      y = PAGE_HEIGHT - MARGIN_TOP;
    }

    current.push({ text, x, y, font, size });
    y -= leading;
  }

  function addWrapped(text, options = {}) {
    wrapText(text, options.size || 11).forEach((line) => addLine(line, options));
  }

  blocks.forEach((block) => {
    if (block.type === "space") {
      y -= 6;
      return;
    }

    if (block.type === "title") {
      y -= 8;
      addWrapped(block.text, { font: "F2", size: 22, leading: 28 });
      y -= 10;
      return;
    }

    if (block.type === "heading") {
      y -= 10;
      addWrapped(block.text, { font: "F2", size: 15, leading: 21 });
      y -= 4;
      return;
    }

    if (block.type === "bullet") {
      addWrapped(`- ${block.text}`, { size: 10.5, leading: 15, x: MARGIN_X + 10 });
      return;
    }

    if (block.type === "number") {
      addWrapped(block.text, { size: 10.5, leading: 15, x: MARGIN_X + 10 });
      return;
    }

    if (block.type === "code") {
      block.text.split("\n").forEach((line) => {
        addLine(sanitize(line), { font: "F3", size: 9.5, leading: 13, x: MARGIN_X + 12 });
      });
      y -= 4;
      return;
    }

    addWrapped(block.text, { size: 11, leading: 16 });
  });

  if (current.length) pages.push(current);
  return pages;
}

function makeContentStream(lines, pageNumber, totalPages) {
  const commands = ["BT"];

  lines.forEach((line) => {
    commands.push(`/${line.font} ${line.size} Tf`);
    commands.push(`${line.x.toFixed(2)} ${line.y.toFixed(2)} Td`);
    commands.push(`(${escapePdf(line.text)}) Tj`);
    commands.push(`${(-line.x).toFixed(2)} ${(-line.y).toFixed(2)} Td`);
  });

  commands.push("/F1 9 Tf");
  commands.push(`${MARGIN_X.toFixed(2)} 28 Td`);
  commands.push(`(WiSafe / Wifi Protect - Defesa do projeto | Pagina ${pageNumber} de ${totalPages}) Tj`);
  commands.push("ET");

  return commands.join("\n");
}

function createPdf(pages) {
  const objects = [];

  function addObject(content) {
    objects.push(content);
    return objects.length;
  }

  const catalogId = addObject("<< /Type /Catalog /Pages 2 0 R >>");
  const pagesId = addObject("");
  const fontRegularId = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  const fontBoldId = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");
  const fontMonoId = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>");
  const pageIds = [];

  pages.forEach((page, index) => {
    const stream = makeContentStream(page, index + 1, pages.length);
    const contentId = addObject(`<< /Length ${Buffer.byteLength(stream, "utf8")} >>\nstream\n${stream}\nendstream`);
    const pageId = addObject(
      `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] ` +
        `/Resources << /Font << /F1 ${fontRegularId} 0 R /F2 ${fontBoldId} 0 R /F3 ${fontMonoId} 0 R >> >> ` +
        `/Contents ${contentId} 0 R >>`,
    );
    pageIds.push(pageId);
  });

  objects[pagesId - 1] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`;

  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf, "utf8"));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = Buffer.byteLength(pdf, "utf8");
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  return pdf;
}

const blocks = parseMarkdown(markdown);
const pages = buildPages(blocks);
fs.writeFileSync(outputPath, createPdf(pages), "binary");
console.log(`PDF gerado: ${outputPath}`);
console.log(`Paginas: ${pages.length}`);
