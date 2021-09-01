import GetAppIcon from '@material-ui/icons/GetApp';

import firebase from 'firebase/app';
import { useEffect, useRef, useState } from 'react';

import styles from '../../styles/components/widgets/Sketch.module.css';

// width and height of canvas
const width = 256;
const height = 256;

let canvas, ctx;

let sketching = false;

let prevX, prevY;
let currX, currY;

export default function Sketch(props) {
  const { group, channel } = props;

  const [lineColor, setLineColor] = useState('black');
  const [lineWidth, setLineWidth] = useState(2);

  const canvasRef = useRef();

  // retrieve sketch reference
  const groupsRef = firebase.firestore().collection('groups');
  const groupRef = groupsRef.doc(group);
  const channelsRef = groupRef.collection('channels')
  const channelRef = channelsRef.doc(channel);

  // sketches canvas with given mouse event data
  function sketch(e) {
    // get previous and current mouse positions
    prevX = currX;
    prevY = currY;
    currX = e.clientX - canvas.offsetLeft + window.scrollX;
    currY = e.clientY - canvas.offsetTop + window.scrollY;
    // return if no previous data
    if (prevX === undefined || prevY === undefined) return;
    // draw stroke
    ctx.beginPath();
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(currX, currY);
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
    ctx.closePath();
  }

  // downloads canvas as a png
  function downloadCanvas() {
    // get canvas object url
    canvas.toBlob(blob => {
      const url = URL.createObjectURL(blob);
      // download from link element
      const link = document.createElement('a');
      link.download = 'sketch.png';
      link.href = url;
      link.click();
    });
  }

  // saves canvas to firebase
  async function saveCanvas() {
    const sketch = canvas.toDataURL();
    await channelRef.update({ sketch });
  }

  // retrieve canvas from firebase
  async function getCanvas() {
    // get sketch
    const channelDoc = await channelRef.get();
    const sketch = channelDoc.data().sketch;
    // load image if sketch
    if (sketch) {
      const image = new Image();
      image.onload = () => {
        ctx.drawImage(image, 0, 0);
        setLoaded(true);
      }
      image.src = sketch;
    } else setLoaded(true);
  }

  // retrieve canvas context on start
  useEffect(() => {
    canvas = canvasRef.current;
    ctx = canvas.getContext('2d');
    getCanvas();
  }, []);

  return (
    <div className={styles.container}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onMouseDown={e => { sketching = true; sketch(e); }}
        onMouseMove={e => { if (sketching) sketch(e); }}
        onMouseUp={e => { sketching = false; }}
        onMouseLeave={e => { sketching = false; }}
      />
      <button onClick={downloadCanvas}>
        <GetAppIcon />
      </button>
    </div>
  );
}
