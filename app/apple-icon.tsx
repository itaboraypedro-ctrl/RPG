import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

export default async function AppleIcon() {
  const cinzel = await readFile(
    join(process.cwd(), "assets/fonts/Cinzel-Bold.ttf")
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(160deg, #161625 0%, #07070d 70%)",
        }}
      >
        <div
          style={{
            fontFamily: "Cinzel",
            fontSize: 120,
            fontWeight: 700,
            color: "#f0cc6a",
            marginTop: -10,
          }}
        >
          A
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Cinzel",
          data: cinzel,
          weight: 700,
          style: "normal",
        },
      ],
    }
  );
}
