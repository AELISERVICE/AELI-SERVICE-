import React from "react";
import { WavyMarquee } from "../ui/WavyMarquee";

export function Banner() {
  const threadsPath =
    "M 800,1200 C 800,1000 900,700 500,750 C 100,800 0,400 300,500 C 600,600 700,200 800,0";
  const loopPath =
    "M 900,100 C 700,100 600,400 800,500 C 1000,600 900,900 700,1000";

  const automationServices = [
    "AUTOMATISATION DE TÂCHES RÉPÉTITIVES",
    "OPTIMISATION DE VOS PROCESSUS MÉTIERS",
    "DÉPLOIEMENT DE SOLUTIONS IA SUR-MESURE",
    "TRANSFORMATION DIGITALE ACCÉLÉRÉE",
  ];

  const dataServices = [
    "INGÉNIERIE DE DONNÉES CLOUD",
    "ANALYSE PRÉDICTIVE ET TABLEAUX DE BORD",
    "DÉVELOPPEMENT D'APPLICATIONS WEB ROBUSTES",
    "ARCHITECTURE IT ÉVOLUTIVE",
  ];

  return (
    <div className="absolute inset-0 opacity-100 flex flex-col justify-between py-10">
      <WavyMarquee
        id="mainLoop"
        text={automationServices}
        pathDefinition={threadsPath}
        speed={0.02}
        className="opacity-100"
      />
      <WavyMarquee
        id="sideLoop"
        text={dataServices}
        pathDefinition={loopPath}
        speed={0.03}
        className="opacity-100"
      />
    </div>
  );
}
