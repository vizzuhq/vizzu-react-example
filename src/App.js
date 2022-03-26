import Vizzu from "vizzu";
import VizzuModule from 'vizzu/dist/cvizzu.wasm';
import { data } from "./demoData";
import { useRef, useEffect, useState } from "react";
import "./App.css";

Vizzu.options({ wasmUrl: VizzuModule });

function App() {
  const canvasRef = useRef();
  const chartRef = useRef();
  const [xDimensionState, setXDimensionState] = useState();

  const dimensions = data.series
    .filter((s) => s.type === "dimension")
    .map((s) => s.name);

  useEffect(() => {
    if (!chartRef.current) return;
    chartRef.current.animate({
      config: { channels: { x: { set: [xDimensionState] } } },
    });
  }, [xDimensionState]);

  useEffect(() => {
    if (chartRef.current) return; // this is needed because of Hot Module Replacement
    chartRef.current = new Vizzu(canvasRef.current, { data });
    chartRef.current.initializing.then((chart) =>
      chart.animate({
        config: {
          channels: {
            y: { set: ["Popularity"] },
            x: { set: ["Genres"] },
          },
        },
      })
    );
  }, []);

  return (
    <div id="wrapper">
      <h1>Vizzu React Example</h1>
      <canvas ref={canvasRef} style={{ width: "800px", height: "480px" }} />
      <h2>Break it down by</h2>
      <div id="breakdownSelector">
        {dimensions.map((dim) => {
          return (
            <button
              onClick={() => {
                setXDimensionState(dim);
              }}
              key={dim}
            >
              {dim}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default App;
