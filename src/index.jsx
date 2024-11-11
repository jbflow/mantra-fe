// import 'regenerator-runtime/runtime'
import { createRoot } from 'react-dom/client';
import Main from './Main';

if (!localStorage.getItem("preferences")) {
    localStorage.setItem("preferences", JSON.stringify({ voice: { wakeWord: "computer", language: "en-UK" } }))
  }


const container = document.getElementById('app');
const root = createRoot(container);
root.render(<Main />);
