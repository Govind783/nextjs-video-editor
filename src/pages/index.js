import Image from "next/image";
import { Inter } from "next/font/google";
import VideoEditor from "@/componentsDIR/VideoEditor/VideoEditor";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between ${inter.className}`}
    >
     <VideoEditor />
    </main>
  );
}
