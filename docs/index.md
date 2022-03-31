Using Vizzu with React and the usual tooling around it (namely, module bundlers) is not trivial.
This document provides step-by-step instructions to setting up a working Vizzu project with React. For the sake of simplicity, we will use the create-react-app (CRA) package to scaffold our project but the lessons learnt can be applied to existing or new projects even if they don't use Webpack like CRA does.

Let's go through this process together. If you're not interested in the detailed description, only the main takeaways, skip to the [summary](#summary) at the end.

> Note: This guide is for React 16.8 and above.

## Bootstrap the application with CRA

First, let's allow create-react-app to take care of the basic setup of our app

```bash
npx create-react-app my_react_vizzu_project
cd my_react_vizzu_project
```

This will create a basic React app in a new my_react_vizzu_project folder.

## Override CRA's Webpack config

Unfortunately, Webpack which create-react-app uses under the hood to bundle our code doesn't play nicely with output from Emscripten which Vizzu uses to turn its C++ code into WebAssembly.

create-react-app does not provide a way to tinker with its Webpack config (only through "ejecting" it, which noone seems to like to do), so we need a couple tools to override it and force the loading of the .wasm files.

### Install the npm packages we need

```bash
npm install react-app-rewired
```

react-app-rewired allows us to inject/override the Webpack configuration.

### Create a config-overrides.js file in the project's root

This file will be read by react-app-rewired at build-time and used to inject new rules into the Webpack build. This should be its content.

```javascript
// config-overrides.js
module.exports = {
  webpack: function override(config, env) {
    config.module.rules.push({
      test: /cvizzu\.wasm$/,
      type: "javascript/auto",
      loader: "file-loader",
    });

    return config;
  },
};
```

### Modify your package.json

Here, we are going to make changes to ensure that react-app-rewired is called instead of react-scripts.
You should change value of the `scripts` key in your package.json in the root of the project.

```diff
# package.json
"scripts": {
-  "start": "react-scripts start",
+  "start": "react-app-rewired start",
-  "build": "react-scripts build",
+  "build": "react-app-rewired build",
  "test": "react-scripts test",
  "eject": "react-scripts eject",
}
```

## Install Vizzu with npm

```bash
npm install vizzu
```

## Simply following the example from the Vizzu docs in React will fail

If we try to set up a basic bar chart based on the Vizzu documentation in the React app, it will fail. Let's try and do it regardless, as it will be informative when it does.

### Add some data

We need some data to visualize, so let's create a new file called demoData.js in the src/ folder with the following content:

```javascript
// src/demoData.js
export const data = {
  series: [
    { name: "Genres", type: "dimension" },
    { name: "Types", type: "dimension" },
    { name: "Popularity", type: "measure" },
  ],
  records: [
    ["Pop", "Hard", 114],
    ["Rock", "Hard", 96],
    ["Jazz", "Hard", 78],
    ["Metal", "Hard", 52],
    ["Pop", "Smooth", 56],
    ["Rock", "Smooth", 36],
    ["Jazz", "Smooth", 174],
    ["Metal", "Smooth", 121],
    ["Pop", "Experimental", 127],
    ["Rock", "Experimental", 83],
    ["Jazz", "Experimental", 94],
    ["Metal", "Experimental", 58],
  ],
};
```

### Try and create a chart

Replace the contents of src/App.js with the following.

{%raw%}

```jsx
// src/App.js
import Vizzu from "vizzu";
import VizzuModule from 'vizzu/dist/cvizzu.wasm';
import { data } from "./demoData";

Vizzu.options({ wasmUrl: VizzuModule });

function App() {
  const chart = new Vizzu("myVizzu", { data });
  chart.initializing.then((chart) =>
    chart.animate({
      config: {
        channels: {
          y: { set: ["Popularity"] },
          x: { set: ["Genres"] },
        },
      },
    })
  );
  return <canvas id="myVizzu" style={{ width: "800px", height: "480px" }} />;
}

export default App;
```

{%endraw%}

Note, that we added an import statement for the .wasm module as well, and
we set the module location for Vizzu manually. This will ensure that the 
.wasm module will be loaded from the final location determined by Webpack. 

Let's run it!

```bash
npm start
```

This should normally open up a browser window with our page displayed in it.
However, when we run this, it will show an empty page, as Vizzu fails with the following error displayed in the console of our web browser:
`Uncaught Error: Cannot find container null to render Vizzu!`

The problem is that both Vizzu and React want to modify the DOM directly and once React does, Vizzu cannot find its container element.

### We need the useRef() hook

As we have seen above Vizzu requires an imperative handle on the state of the canvas element, but we want React to be responsible for the overall structure of our page. In React Hooks this separation is usually accomplished using the `useRef()` and `useEffect()` hooks together (see [React docs](https://reactjs.org/docs/hooks-reference.html#useref)).

We can rewrite our src/App.js accordingly:

{%raw%}

```jsx
// src/App.js
import Vizzu from "vizzu";
import VizzuModule from 'vizzu/dist/cvizzu.wasm';
import { data } from "./demoData";
import { useRef, useEffect } from "react";

Vizzu.options({ wasmUrl: VizzuModule });

function App() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const chart = new Vizzu(canvasRef.current, { data });
    chart.initializing.then((chart) =>
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
    <canvas
      ref={canvasRef}
      id="myVizzu"
      style={{ width: "800px", height: "480px" }}
    />
  );
}

export default App;
```

{%endraw%}

When we save the file, after a brief load, simple bar chart should be displayed in the same browser window.
If we hadn't had set up .wasm loading by this point, compilation in Webpack would still fail because the Vizzu package wouldn't be able to find its .wasm files.

## Add interactivity

We could stop here, but there would have been absolutely no point in using React as we are displaying a static chart. Let's add a couple buttons to enable changing between different dimensions.

{%raw%}

```jsx
//src/App.js
import Vizzu from "vizzu";
import VizzuModule from 'vizzu/dist/cvizzu.wasm';
import { data } from "./demoData";
import { useRef, useEffect, useState } from "react";

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
      <canvas ref={canvasRef} style={{ width: "800px", height: "480px" }} />
      <div id="breakdownChooser">
        <h2>Break it down by</h2>
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
```

{%endraw%}

Notice that we've added another `useRef()`. We need this to keep track of our `chart` object between renders, so we can initiate animations in the new `useEffect()`. In most production settings this will be necessary.

## Summary

1. Make sure that Vizzu can load its .wasm file

   - For Webpack (create-react-app, Next.js, Vite production mode):

     1. Set the .wasm module location explicitly for Vizzu using `Vizzu.options({ wasmUrl })`
     2. Override the webpack config (in case of CRA, use `react-app-rewired`) so it loads the .wasm file needed by Vizzu

2. To use Vizzu in React
   - Make sure to use `useRef()` to access the DOM directly
   - Use `useEffect()` to trigger the animations when needed. Use a second ref to keep track of your chart object
   - Optionally have a third ref for the animation objects emitted to enable animation control (not covered above)
