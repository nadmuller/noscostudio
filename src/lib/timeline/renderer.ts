import type { Task } from "../types";

const STATUS_LABEL: Record<string, string> = {
  done: "Concluida",
  progress: "Em andamento",
  pending: "Nao iniciado",
};

const MONTHS_PT: Record<number, string> = {
  0: "Janeiro", 1: "Fevereiro", 2: "Marco", 3: "Abril",
  4: "Maio", 5: "Junho", 6: "Julho", 7: "Agosto",
  8: "Setembro", 9: "Outubro", 10: "Novembro", 11: "Dezembro",
};

function fmt(str: string): string {
  const d = new Date(str + "T12:00:00");
  return String(d.getDate()).padStart(2, "0") + "/" + String(d.getMonth() + 1).padStart(2, "0");
}

function dotCls(s: string): string {
  return { done: "s-done", progress: "s-progress", pending: "s-pending" }[s] || "s-pending";
}

export interface RenderResult {
  cleanup: () => void;
}

export function renderTimeline(
  canvas: HTMLElement,
  scrollContainer: HTMLElement,
  tooltip: HTMLElement,
  tasks: Task[],
  onPinClick?: (task: Task) => void
): RenderResult {
  // Clear canvas
  canvas.innerHTML = "";

  if (tasks.length === 0) return { cleanup: () => {} };

  // Compute date range from tasks
  const dates = tasks.map((t) => new Date(t.due_date + "T12:00:00"));
  const minDate = new Date(Math.min(...dates.map((d) => d.getTime())));
  const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())));

  // Expand to full months
  const tStart = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
  const tEnd = new Date(maxDate.getFullYear(), maxDate.getMonth() + 1, 0);

  // Build month starts
  const monthStarts: Date[] = [];
  const monthNames: string[] = [];
  const cur = new Date(tStart);
  while (cur <= tEnd) {
    monthStarts.push(new Date(cur));
    monthNames.push(MONTHS_PT[cur.getMonth()]);
    cur.setMonth(cur.getMonth() + 1);
  }

  const numMonths = monthStarts.length;
  const CANVAS_PAD = 120;
  const MIN_COL_W = 320;
  const COL_W = Math.max(MIN_COL_W, Math.floor(window.innerWidth / numMonths));
  const TOTAL_W = COL_W * numMonths;

  const hdr = document.querySelector(".tl-header")?.getBoundingClientRect().height || 88;
  const ftr = 52;
  const AVAIL = window.innerHeight - hdr - ftr;

  const AXIS_H = 2;
  const ABOVE_H = Math.round(AVAIL * 0.5);
  const BELOW_H = AVAIL - ABOVE_H - AXIS_H;

  const A_STEMS = [0.72, 0.62, 0.52, 0.44, 0.36, 0.28, 0.20, 0.13, 0.07].map((p) => Math.round(ABOVE_H * p));
  const B_STEMS = [0.70, 0.60, 0.50, 0.42, 0.34, 0.26, 0.18, 0.11, 0.05].map((p) => Math.round(BELOW_H * p));

  function toX(str: string): number {
    const d = new Date(str + "T12:00:00");
    return Math.round(CANVAS_PAD + ((d.getTime() - tStart.getTime()) / (tEnd.getTime() - tStart.getTime())) * TOTAL_W);
  }

  // Probe for measuring label widths
  const probe = document.createElement("div");
  probe.style.cssText =
    'position:fixed;visibility:hidden;pointer-events:none;top:-9999px;left:-9999px;white-space:nowrap;font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;';
  document.body.appendChild(probe);

  function measureW(task: Task): number {
    const lines = [
      `<span style="font-size:9px;letter-spacing:0.18em;text-transform:uppercase;">${task.group_name}</span>`,
      `<span style="font-size:13px;">${task.name}</span>`,
      `<span style="font-size:15px;font-weight:700;">${fmt(task.due_date)}</span>`,
    ];
    probe.innerHTML = lines.map((l) => `<div style="display:block;">${l}</div>`).join("");
    let maxW = 0;
    for (const child of Array.from(probe.children)) {
      maxW = Math.max(maxW, child.getBoundingClientRect().width);
    }
    return Math.ceil(maxW) + 28;
  }

  // Anti-collision
  const LBL_H = 80;
  const HPAD = 24;
  const VPAD = 12;
  const placed: { above: { lx1: number; lx2: number; ly1: number; ly2: number }[]; below: { lx1: number; lx2: number; ly1: number; ly2: number }[] } = {
    above: [],
    below: [],
  };

  function getBounds(cx: number, stemH: number, side: string, lw: number) {
    const half = lw / 2;
    if (side === "above") {
      const stemTop = ABOVE_H - stemH;
      return { lx1: cx - half - HPAD, lx2: cx + half + HPAD, ly1: stemTop - LBL_H - VPAD, ly2: stemTop + VPAD };
    } else {
      const stemBot = ABOVE_H + AXIS_H + stemH;
      return { lx1: cx - half - HPAD, lx2: cx + half + HPAD, ly1: stemBot - VPAD, ly2: stemBot + LBL_H + VPAD };
    }
  }

  function collides(b: { lx1: number; lx2: number; ly1: number; ly2: number }, side: "above" | "below") {
    for (const p of placed[side]) {
      if (b.lx2 > p.lx1 && b.lx1 < p.lx2 && b.ly2 > p.ly1 && b.ly1 < p.ly2) return true;
    }
    return false;
  }

  function pickStem(cx: number, side: "above" | "below", lw: number): number {
    const stems = side === "above" ? A_STEMS : B_STEMS;
    for (const sh of stems) {
      if (!collides(getBounds(cx, sh, side, lw), side)) return sh;
    }
    const maxH = side === "above" ? ABOVE_H - 10 : BELOW_H - 10;
    for (let sh = 20; sh <= maxH; sh += 12) {
      if (!collides(getBounds(cx, sh, side, lw), side)) return sh;
    }
    return stems[0];
  }

  // Build canvas
  const canvasW = Math.max(TOTAL_W + CANVAS_PAD * 2, window.innerWidth);
  canvas.style.width = canvasW + "px";
  canvas.style.minWidth = canvasW + "px";
  canvas.style.height = ABOVE_H + AXIS_H + BELOW_H + "px";

  // Month columns
  monthStarts.forEach((_, i) => {
    const col = document.createElement("div");
    col.className = "mcol" + (i % 2 === 1 ? " alt" : "");
    col.style.left = CANVAS_PAD + i * COL_W + "px";
    col.style.width = COL_W + "px";
    canvas.appendChild(col);

    if (i > 0) {
      const line = document.createElement("div");
      line.className = "mcol-line";
      line.style.left = CANVAS_PAD + i * COL_W + "px";
      canvas.appendChild(line);
    }
  });

  // Axis
  const axis = document.createElement("div");
  axis.className = "axis";
  axis.style.top = ABOVE_H + "px";
  axis.style.left = CANVAS_PAD + "px";
  axis.style.right = CANVAS_PAD + "px";
  monthNames.forEach((name, i) => {
    const cell = document.createElement("div");
    cell.className = "acell";
    cell.style.flex = "0 0 " + COL_W + "px";
    cell.innerHTML = `<span class="mn">${name}</span>`;
    axis.appendChild(cell);
  });
  canvas.appendChild(axis);

  // Today pin
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  if (today >= tStart && today <= tEnd) {
    const todayX = toX(todayStr);
    const todayPin = document.createElement("div");
    todayPin.className = "today-pin";
    todayPin.style.left = todayX + "px";
    todayPin.style.bottom = BELOW_H + AXIS_H + "px";
    todayPin.innerHTML = `
      <div class="today-pill">Hoje</div>
      <div class="today-stem" style="height:28px"></div>
      <div class="today-dot"></div>
    `;
    canvas.appendChild(todayPin);
  }

  // Render pins
  const sorted = [...tasks].sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());

  sorted.forEach((task, i) => {
    const cx = toX(task.due_date);
    const side: "above" | "below" = i % 2 === 0 ? "above" : "below";
    const lw = measureW(task);
    const stemH = pickStem(cx, side, lw);
    placed[side].push(getBounds(cx, stemH, side, lw));

    const pin = document.createElement("div");
    pin.className = `pin ${side}`;
    pin.dataset.status = STATUS_LABEL[task.status] || task.status;
    pin.dataset.taskId = task.id;
    pin.style.left = cx + "px";

    if (side === "above") {
      pin.style.bottom = BELOW_H + AXIS_H + "px";
      pin.style.top = "auto";
    } else {
      pin.style.top = ABOVE_H + AXIS_H + "px";
      pin.style.bottom = "auto";
    }

    pin.innerHTML = `
      <div class="plabel">
        <span class="pg">${task.group_name}</span>
        <span class="pn">${task.name}</span>
      </div>
      <div class="pdate">${fmt(task.due_date)}</div>
      <div class="pstem" style="height:${stemH}px"></div>
      <div class="pdot ${dotCls(task.status)}"></div>
    `;

    if (onPinClick) {
      pin.addEventListener("click", () => onPinClick(task));
    }

    canvas.appendChild(pin);
  });

  document.body.removeChild(probe);

  // Tooltip
  const handleOver = (e: MouseEvent) => {
    const pin = (e.target as HTMLElement).closest(".pin") as HTMLElement | null;
    if (pin?.dataset.status) {
      tooltip.textContent = pin.dataset.status;
      tooltip.style.display = "block";
    }
  };
  const handleMove = (e: MouseEvent) => {
    tooltip.style.left = e.clientX + "px";
    tooltip.style.top = e.clientY - 32 + "px";
  };
  const handleOut = (e: MouseEvent) => {
    const related = e.relatedTarget as HTMLElement | null;
    if (!related || !related.closest(".pin")) {
      tooltip.style.display = "none";
    }
  };

  canvas.addEventListener("mouseover", handleOver);
  canvas.addEventListener("mousemove", handleMove);
  canvas.addEventListener("mouseout", handleOut);

  // Keyboard nav
  const handleKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") scrollContainer.scrollBy({ left: 200, behavior: "smooth" });
    if (e.key === "ArrowLeft") scrollContainer.scrollBy({ left: -200, behavior: "smooth" });
  };
  document.addEventListener("keydown", handleKey);

  // Scroll to today
  if (today >= tStart && today <= tEnd) {
    const todayX = toX(todayStr);
    const scrollTarget = todayX - window.innerWidth / 2;
    setTimeout(() => scrollContainer.scrollTo({ left: Math.max(0, scrollTarget), behavior: "smooth" }), 100);
  }

  return {
    cleanup: () => {
      canvas.removeEventListener("mouseover", handleOver);
      canvas.removeEventListener("mousemove", handleMove);
      canvas.removeEventListener("mouseout", handleOut);
      document.removeEventListener("keydown", handleKey);
      canvas.innerHTML = "";
    },
  };
}
