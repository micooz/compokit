import { ScrollTop } from "primereact/scrolltop";
import { ConfirmDialog } from "primereact/confirmdialog";

import { ToneLoader } from "@/components/ToneLoader";

import { ModeList } from "./components/ModeList";
import { ProgressionDesigner } from "./components/ProgressionDesigner";
import { Header } from "./components/Header";

export default function Home() {
  return (
    <main className="pb-8">
      <Header />
      <ToneLoader />
      <ProgressionDesigner className="mb-8 px-4" />
      <ModeList className="px-4" />
      <ConfirmDialog />
      <ScrollTop />
    </main>
  );
}
