# [Gyrograms](https://miniature-carnival-vmplkew.pages.github.io/)

<p align="left">
  <a href="https://github.com/midjourney/Gyrograms/deployments/activity_log?environment=github-pages">
      <img src="https://img.shields.io/github/deployments/midjourney/Gyrograms/github-pages?label=Github%20Pages%20Deployment" title="Github Pages Deployment"></a>
  <a href="https://github.com/midjourney/Gyrograms/commits/main">
      <img src="https://img.shields.io/github/last-commit/midjourney/Gyrograms" title="Last Commit Date"></a>
  <a href="https://github.com/midjourney/Gyrograms/blob/master/LICENSE">
      <img src="https://img.shields.io/github/license/midjourney/Gyrograms" title="License: MIT"></a>
</p>

A viewer for 360 spinning phone zoetrope displays.

 # Building

This demo can either be run without building (in Chrome/Edge/Opera since raw three.js examples need [Import Maps](https://caniuse.com/import-maps)), or built with:
```
npm install
npm run build
```
After building, make sure to edit the index .html to point from `"./src/main.js"` to `"./build/main.js"`.

 # Dependencies
 - [three.js](https://github.com/mrdoob/three.js/) (3D Rendering Engine)
 - [esbuild](https://github.com/evanw/esbuild/) (Bundler)
