import { redirect } from "next/navigation";

export default function Neopage() {
    // Redirect any visit to the internal NEO/PHA route to the external simulation
    redirect("https://nolaskote.github.io/simulatio_next");
}