import { Inter } from "next/font/google";
import VideoEditor from "@/componentsDIR/VideoEditor/VideoEditor";
import { AlertCircle, Laptop } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });//

export default function Home() {
  return (
    <main className={`flex min-h-screen flex-col items-center justify-between ${inter.className}`}>
      <div className="lg:flex hidden w-full min-h-screen flex-col">
        <VideoEditor />
      </div>
      <div className="min-h-screen lg:hidden bg-black text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <Laptop className="w-16 h-16 mx-auto text-white" />
          <h1 className="text-2xl font-bold">Desktop Only</h1>
          <p className="max-w-md text-sm text-gray-500">
            The editor works only on desktop. Please come back using a computer for the best experience.
          </p>
          <AlertCircle className="w-8 h-8 mx-auto text-gray-500" />
        </div>
      </div>
    </main>
  );
}
