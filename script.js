// script.js (type="module")
const onProgress = (event) => {
  const progressBar = event.target.querySelector('.progress-bar');
  const updatingBar = event.target.querySelector('.update-bar');
  updatingBar.style.width = `${event.detail.totalProgress * 100}%`;
  if (event.detail.totalProgress === 1) {
    progressBar.classList.add('hide');
    event.target.removeEventListener('progress', onProgress);
  } else {
    progressBar.classList.remove('hide');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const modelViewer = document.querySelector('#dimension-demo');
  if (!modelViewer) return console.error('ModelViewer not found');
  modelViewer.addEventListener('progress', onProgress);

  // Selector 변경
  const srcSelect = modelViewer.querySelector('#src');
  if (srcSelect) srcSelect.addEventListener('input', (e) => {
    modelViewer.src = e.target.value;
  });

  // Show/hide dimensions
  const checkbox = modelViewer.querySelector('#show-dimensions');
  const dimElements = [...modelViewer.querySelectorAll('button[class*="dim"], svg#dimLines')];
  const setVisibility = (visible) => {
    dimElements.forEach(el => el.classList.toggle('hide', !visible));
  };
  if (checkbox) {
    checkbox.addEventListener('change', () => setVisibility(checkbox.checked));
    modelViewer.addEventListener('ar-status', (e) => {
      setVisibility(checkbox.checked && e.detail.status !== 'session-started');
    });
  }

  // Draw dimension lines
  const dimLines = modelViewer.querySelectorAll('svg#dimLines line');
  const drawLine = (svgLine, dot1, dot2, dimHotspot) => {
    if (!svgLine || !dot1 || !dot2) return;
    svgLine.setAttribute('x1', dot1.canvasPosition.x);
    svgLine.setAttribute('y1', dot1.canvasPosition.y);
    svgLine.setAttribute('x2', dot2.canvasPosition.x);
    svgLine.setAttribute('y2', dot2.canvasPosition.y);
    if (dimHotspot) svgLine.classList.toggle('hide', !dimHotspot.facingCamera);
  };
  const renderSVG = () => {
    const q = name => modelViewer.queryHotspot(name);
    drawLine(dimLines[0], q('hotspot-dot+X-Y+Z'), q('hotspot-dot+X-Y-Z'), q('hotspot-dim+X-Y'));
    drawLine(dimLines[1], q('hotspot-dot+X-Y-Z'), q('hotspot-dot+X+Y-Z'), q('hotspot-dim+X-Z'));
    drawLine(dimLines[2], q('hotspot-dot+X+Y-Z'), q('hotspot-dot-X+Y-Z'));
    drawLine(dimLines[3], q('hotspot-dot-X+Y-Z'), q('hotspot-dot-X-Y-Z'), q('hotspot-dim-X-Z'));
    drawLine(dimLines[4], q('hotspot-dot-X-Y-Z'), q('hotspot-dot-X-Y+Z'), q('hotspot-dim-X-Y'));
  };

  modelViewer.addEventListener('load', () => {
    const center = modelViewer.getBoundingBoxCenter();
    const size = modelViewer.getDimensions();
    const [x2, y2, z2] = [size.x/2, size.y/2, size.z/2];

    // Update hotspots with dynamic positions and labels
    const updates = [
      ['hotspot-dot+X-Y+Z', `${center.x+x2} ${center.y-y2} ${center.z+z2}`],
      ['hotspot-dim+X-Y', `${center.x+x2*1.2} ${center.y-y2*1.1} ${center.z}`, `${(size.z*100).toFixed(1)} cm`],
      ['hotspot-dot+X-Y-Z', `${center.x+x2} ${center.y-y2} ${center.z-z2}`],
      ['hotspot-dim+X-Z', `${center.x+x2*1.2} ${center.y} ${center.z-z2*1.2}`, `${(size.y*100).toFixed(1)} cm`],
      ['hotspot-dot+X+Y-Z', `${center.x+x2} ${center.y+y2} ${center.z-z2}`],
      ['hotspot-dim+Y-Z', `${center.x} ${center.y+y2*1.1} ${center.z-z2*1.1}`, `${(size.x*100).toFixed(1)} cm`],
      ['hotspot-dot-X+Y-Z', `${center.x-x2} ${center.y+y2} ${center.z-z2}`],
      ['hotspot-dim-X-Z', `${center.x-x2*1.2} ${center.y} ${center.z-z2*1.2}`, `${(size.y*100).toFixed(1)} cm`],
      ['hotspot-dot-X-Y-Z', `${center.x-x2} ${center.y-y2} ${center.z-z2}`],
      ['hotspot-dim-X-Y', `${center.x-x2*1.2} ${center.y-y2*1.1} ${center.z}`, `${(size.z*100).toFixed(1)} cm`],
      ['hotspot-dot-X-Y+Z', `${center.x-x2} ${center.y-y2} ${center.z+z2}`]
    ];

    updates.forEach(([name, pos, label]) => {
      modelViewer.updateHotspot({ name, position: pos });
      if (label) {
        const btn = modelViewer.querySelector(`button[slot="${name}"]`);
        if (btn) btn.textContent = label;
      }
    });
    renderSVG();
    modelViewer.addEventListener('camera-change', renderSVG);
  });
});