import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const exclude = searchParams.get("exclude")?.trim();
  const filePath = path.join(process.cwd(), "Подсказки.txt");

  try {
    const file = await fs.readFile(filePath, "utf8");
    const hints = file
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    if (hints.length === 0) {
      return NextResponse.json({ error: "Подсказки не найдены" }, { status: 404 });
    }

    const availableHints = exclude && hints.length > 1 ? hints.filter((hint) => hint !== exclude) : hints;
    const hint = availableHints[Math.floor(Math.random() * availableHints.length)];

    return NextResponse.json(
      { hint },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch {
    return NextResponse.json({ error: "Не удалось загрузить подсказку" }, { status: 500 });
  }
}
