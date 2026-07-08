/**
 * Draws the Bharath Wagons branded header on a jsPDF document page.
 * Logo (BW-iconic.png) on the left, "BHARATH WAGONS" title on the right,
 * then a subtitle line below describing what is being exported.
 *
 * Returns the Y position where content should start after the header.
 */
export async function drawPDFHeader(doc, subtitle = "") {
  const pageW = doc.internal.pageSize.width;
  const HEADER_H = 36;

  // ── Background bar ──────────────────────────────────────────────────────────
  doc.setFillColor(7, 22, 40);          // deep navy
  doc.rect(0, 0, pageW, HEADER_H, "F");

  // ── Accent line at bottom of header ─────────────────────────────────────────
  doc.setDrawColor(59, 130, 246);
  doc.setLineWidth(0.8);
  doc.line(0, HEADER_H, pageW, HEADER_H);

  // ── Logo ────────────────────────────────────────────────────────────────────
  try {
    const logoDataUrl = await loadImageAsDataURL("/BW-iconic.png");
    // Square logo: 28×28, vertically centred in the 36-high bar → top = (36-28)/2 = 4
    doc.addImage(logoDataUrl, "PNG", 8, 4, 28, 28);
  } catch {
    // If logo fails, draw a placeholder circle
    doc.setFillColor(59, 130, 246);
    doc.circle(22, 18, 12, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("BW", 18, 21);
  }

  // ── "BHARATH WAGONS" title (right of logo) ──────────────────────────────────
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("BHARATH WAGONS", 44, 16);

  // ── Tagline ─────────────────────────────────────────────────────────────────
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(148, 163, 184);
  doc.text("Indian Railways Command Center  ·  Real-time Fleet Intelligence", 44, 25);

  // ── Generated timestamp (top-right) ─────────────────────────────────────────
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  const ts = `Generated: ${new Date().toLocaleString("en-IN")}`;
  doc.text(ts, pageW - 14, 10, { align: "right" });

  // ── Subtitle / report description ───────────────────────────────────────────
  if (subtitle) {
    doc.setFillColor(13, 31, 60);
    doc.rect(0, HEADER_H, pageW, 14, "F");
    doc.setTextColor(203, 213, 225);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(subtitle, 14, HEADER_H + 9);
    return HEADER_H + 18; // content starts here
  }

  return HEADER_H + 6;
}

/**
 * Draws the footer on every page of the document.
 */
export function drawPDFFooter(doc) {
  const pages = doc.internal.getNumberOfPages();
  const pageW = doc.internal.pageSize.width;
  const pageH = doc.internal.pageSize.height;
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setDrawColor(30, 58, 95);
    doc.setLineWidth(0.4);
    doc.line(14, pageH - 12, pageW - 14, pageH - 12);
    doc.setFontSize(7.5);
    doc.setTextColor(74, 111, 165);
    doc.text("Bharath Wagons  ·  Ministry of Railways  ·  Confidential", 14, pageH - 6);
    doc.text(`Page ${i} of ${pages}`, pageW - 14, pageH - 6, { align: "right" });
  }
}

// ── Internal helper ──────────────────────────────────────────────────────────
function loadImageAsDataURL(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      canvas.getContext("2d").drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = reject;
    img.src = src;
  });
}
