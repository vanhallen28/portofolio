import { ogImage, ogSize } from "@/lib/og";

export const alt = "Virgiawan Listanto";
export const size = ogSize;
export const contentType = "image/png";
export const revalidate = 600;

export default function Image() {
  return ogImage("id");
}
