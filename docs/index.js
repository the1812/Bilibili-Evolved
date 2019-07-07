import { foo } from './foo.js';

const p = document.createElement('p')
p.innerHTML = foo()
document.body.appendChild(p)