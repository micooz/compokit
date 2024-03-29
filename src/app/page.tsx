import { ToneLoader } from "@/components/ToneLoader";

import { GlobalOptions } from "./components/GlobalOptions";
import { ModeList } from "./components/ModeList";
import { ProgressionDesigner } from "./components/ProgressionDesigner";

export default function Home() {
  return (
    <main className="">
      <ProgressionDesigner className="mb-4 px-4" />
      <GlobalOptions />
      <div className="p-4">
        <ModeList />
      </div>
      <ToneLoader />
    </main>
  );
}
