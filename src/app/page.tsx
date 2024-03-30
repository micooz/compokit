import { ToneLoader } from "@/components/ToneLoader";

import { ModeList } from "./components/ModeList";
import { ProgressionDesigner } from "./components/ProgressionDesigner";
import { Header } from "./components/Header";

export default function Home() {
  return (
    <main className="">
      <Header />
      <ProgressionDesigner className="mb-4 px-4" />
      <ModeList className="px-4" />
      <ToneLoader />
    </main>
  );
}
