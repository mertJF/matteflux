// Tiny HTML templating: html`...` escapes every interpolated value unless it
// is itself html`` or wrapped in raw(). Arrays are joined.

export class Raw {
  constructor(s) { this.s = s; }
  toString() { return this.s; }
}
export const raw = (s) => new Raw(s);

const ESC = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
export const esc = (v) => String(v).replace(/[&<>"']/g, (c) => ESC[c]);

function render(v) {
  if (v === null || v === undefined || v === false) return "";
  if (Array.isArray(v)) return v.map(render).join("");
  if (v instanceof Raw) return v.s;
  return esc(v);
}

export function html(strings, ...values) {
  let out = strings[0];
  values.forEach((v, i) => { out += render(v) + strings[i + 1]; });
  return new Raw(out);
}

// Escape code for display inside <pre><code>.
export const code = (s) => raw(esc(s.replace(/^\n/, "").replace(/\n\s*$/, "")));
