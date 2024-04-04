import 'regenerator-runtime/runtime'
import { createRoot } from 'react-dom/client';
import Authoriser from './Authoriser';
const container = document.getElementById('app');
const root = createRoot(container); // createRoot(container!) if you use TypeScript
root.render(<Authoriser tab="home" />);
