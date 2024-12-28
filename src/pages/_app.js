import { ThemeProvider } from "@/components/ThemeProvider";
import "@/styles/globals.css";
import { Toaster } from "@/components/ui/toaster"

export default function App({ Component, pageProps }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark">
        <Toaster />
      <Component {...pageProps} />
    </ThemeProvider>
  );
}
