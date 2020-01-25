import imgMIT from './assets/img/mit.svg';

const root = document.getElementById('root')!;
root.innerText = 'Hello from TypeScript';

const img = document.createElement('img');
img.src = imgMIT;

root.appendChild(document.createElement('br'));
root.appendChild(img);

console.log('Initial Load', root, imgMIT);

document.getElementById('click-me')!.onclick = (ev: MouseEvent) => {
  console.log('Button Clicked', ev);
};
