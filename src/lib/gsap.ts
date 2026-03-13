import gsap from "gsap";
import { useGSAP } from "@gsap/react";

// Registro global del plugin de React
gsap.registerPlugin(useGSAP);

export { gsap, useGSAP };
